
import { GoogleGenAI, Type } from "@google/genai";
import { OGMetadata } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * URL에서 플랫폼별 고유 식별자(Username, Subreddit, ID)를 정교하게 추출
 */
const extractSearchHints = (url: string) => {
  const lowUrl = url.toLowerCase();
  let searchKeyword = url;
  let platformHint = "General Web";

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const domain = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname;

    if (domain.includes('threads.net')) {
      const parts = path.split('/').filter(Boolean);
      const user = parts.find(p => p.startsWith('@'));
      const postId = parts[parts.indexOf('post') + 1] || '';
      platformHint = `Threads post by ${user || 'unknown user'} with ID ${postId}`;
      searchKeyword = `${user} threads post ${postId}`;
    } else if (domain.includes('reddit.com')) {
      const parts = path.split('/').filter(Boolean);
      const sub = parts[parts.indexOf('r') + 1] || '';
      const titleSlug = parts[parts.indexOf('comments') + 2] || '';
      platformHint = `Reddit post in r/${sub} about ${titleSlug.replace(/_/g, ' ')}`;
      searchKeyword = `reddit r/${sub} ${titleSlug.replace(/_/g, ' ')}`;
    } else if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      platformHint = "YouTube video content";
      searchKeyword = url; // YouTube는 URL 검색이 가장 정확함
    } else if (domain.includes('x.com') || domain.includes('twitter.com')) {
      const user = path.split('/')[1];
      platformHint = `X/Twitter post by @${user}`;
      searchKeyword = `@${user} X post content`;
    }
  } catch (e) {}

  return { searchKeyword, platformHint };
};

export const fetchLinkMetadata = async (url: string): Promise<OGMetadata> => {
  const { searchKeyword, platformHint } = extractSearchHints(url);
  const targetUrl = url.startsWith('http') ? url : `https://${url}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `[SYSTEM] You are an expert OSINT investigator and metadata extractor.
      
      TARGET URL: ${targetUrl}
      SEARCH KEYWORD: ${searchKeyword}
      PLATFORM CONTEXT: ${platformHint}
      
      [INSTRUCTIONS]
      1. Use 'googleSearch' to find this specific URL.
      2. SNS platforms like Threads and Reddit block direct scraping. You MUST rely on the text "snippets" provided in search results.
      3. Look for the most relevant search result that matches the TARGET URL.
      4. RECONSTRUCT the Title and Description by combining available snippets.
      5. If the post content is in a foreign language, translate the summary to English.
      6. For the image, prioritize the actual post thumbnail or the author's profile image if found in snippets.
      
      [JSON OUTPUT RULES]
      - title: "[Author Handle] on [Platform]: [Post Summary]"
      - description: "A detailed 2-sentence summary of the actual post body text."
      - image: "A valid high-res image URL from the search result."
      - domain: "Extracted clean domain (e.g. threads.net)"
      `,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            image: { type: Type.STRING },
            domain: { type: Type.STRING }
          },
          required: ["title", "description", "image", "domain"]
        }
      },
    });

    let responseText = "";
    if (response && typeof response.text === 'string') {
      responseText = response.text;
    } else if (response?.candidates?.[0]?.content?.parts) {
      responseText = response.candidates[0].content.parts.find(p => p.text)?.text || "";
    }

    if (!responseText) throw new Error("Empty AI response");

    const jsonMatch = responseText.trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    
    const data = JSON.parse(jsonMatch[0]);

    // 이미지 절대 경로 확인 및 보정
    if (!data.image || !data.image.startsWith('http') || data.image.includes('placeholder')) {
      const d = data.domain || '';
      if (d.includes('threads')) data.image = "https://images.unsplash.com/photo-1695219762635-42049d59045a?auto=format&fit=crop&w=800&q=80";
      else if (d.includes('reddit')) data.image = "https://images.unsplash.com/photo-1662947193630-945763955688?auto=format&fit=crop&w=800&q=80";
      else if (d.includes('notion')) data.image = "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80";
      else data.image = `https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80`;
    }

    return data;
  } catch (error) {
    console.error("Gemini Scraper Error:", error);
    // 모든 수단 실패 시 URL 기반 최소 정보 반환
    const urlObj = new URL(targetUrl);
    return {
      title: `${platformHint.split(' ')[0]} Shared Resource`,
      description: "Direct content preview is restricted. Click to view the full post in the official app.",
      image: `https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=800&q=80`,
      domain: urlObj.hostname.replace('www.', '')
    };
  }
};

export const moderatePost = async (title: string, description: string): Promise<boolean> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Is this safe for community? Title: ${title}, Desc: ${description}. Answer true/false.`,
    });
    return (response.text || "").toLowerCase().includes('true');
  } catch {
    return true;
  }
};

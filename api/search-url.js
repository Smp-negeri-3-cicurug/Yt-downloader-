import axios from "axios";
import yts from "yt-search";

export const config = {
  runtime: 'edge',
};

// Format duration helper
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Extract video ID from URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export default async function handler(req) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const body = await req.json();
    const { url } = body;
    
    if (!url) {
      return new Response(JSON.stringify({
        success: false,
        error: 'URL tidak boleh kosong'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log(`[SEARCH URL] Processing: ${url}`);

    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'URL YouTube tidak valid'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get video info
    const video = await yts({ videoId });

    if (!video) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Video tidak ditemukan'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log(`[SEARCH URL] Found: ${video.title}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        title: video.title,
        thumbnail: video.thumbnail,
        duration: formatDuration(video.timestamp),
        url: video.url,
        videoId: video.videoId,
        author: video.author?.name || "Unknown"
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('[SEARCH URL ERROR]', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: 'Terjadi kesalahan saat memproses URL'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
    }

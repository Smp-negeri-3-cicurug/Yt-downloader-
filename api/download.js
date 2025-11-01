import axios from "axios";

export const config = {
  runtime: 'edge',
};

// Downloader helper
const ddownr = {
  download: async (url, format) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(
        url
      )}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: { "User-Agent": "Mozilla/5.0" },
    };

    const response = await axios.request(config);
    if (response.data?.success) {
      const { id, title, info } = response.data;
      const downloadUrl = await ddownr.cekProgress(id);
      return { title, downloadUrl, image: info.image, videoUrl: url, format };
    } else {
      throw new Error("Gagal mengambil detail video.");
    }
  },

  cekProgress: async (id) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: { "User-Agent": "Mozilla/5.0" },
    };
    
    let attempts = 0;
    const maxAttempts = 60; // 5 menit (60 * 5 detik)
    
    while (attempts < maxAttempts) {
      const response = await axios.request(config);
      if (response.data?.success && response.data.progress === 1000) {
        return response.data.download_url;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }
    
    throw new Error("Timeout: Download memakan waktu terlalu lama");
  },
};

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
    const { url, format = "mp3" } = body;

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

    console.log(`[DOWNLOAD] Memproses: ${url}`);

    // Download using ddownr
    const result = await ddownr.download(url, format);

    console.log(`[DOWNLOAD] Berhasil: ${result.title}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        title: result.title,
        downloadUrl: result.downloadUrl,
        thumbnail: result.image,
        videoUrl: result.videoUrl,
        format: result.format
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('[DOWNLOAD ERROR]', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Terjadi kesalahan saat mendownload'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
  }

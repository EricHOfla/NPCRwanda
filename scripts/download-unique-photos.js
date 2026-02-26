const fs = require('fs');
const path = require('path');
const https = require('https');

const downloads = [
  { out: 'assets/img/curated/home-hero.jpg', url: 'https://picsum.photos/id/1005/1920/1080' },
  { out: 'assets/img/curated/about-hero.jpg', url: 'https://picsum.photos/id/1011/1600/900' },
  { out: 'assets/img/curated/sports-hero.jpg', url: 'https://picsum.photos/id/1018/1600/900' },
  { out: 'assets/img/curated/community-hero.jpg', url: 'https://picsum.photos/id/1025/1600/900' },
  { out: 'assets/img/curated/news-hero.jpg', url: 'https://picsum.photos/id/1037/1600/900' },
  { out: 'assets/img/curated/news-goalball.jpg', url: 'https://picsum.photos/id/1040/1400/900' },
  { out: 'assets/img/curated/news-volleyball.jpg', url: 'https://picsum.photos/id/1050/1400/900' },
  { out: 'assets/img/curated/news-boccia.jpg', url: 'https://picsum.photos/id/1062/1400/900' },
  { out: 'assets/img/curated/news-community.jpg', url: 'https://picsum.photos/id/1074/1400/900' },
  { out: 'assets/img/curated/index-sport-1.jpg', url: 'https://picsum.photos/id/1084/1200/900' },
  { out: 'assets/img/curated/index-sport-2.jpg', url: 'https://picsum.photos/id/1082/1200/900' },
  { out: 'assets/img/curated/index-sport-3.jpg', url: 'https://picsum.photos/id/1076/1200/900' },
  { out: 'assets/img/curated/index-sport-4.jpg', url: 'https://picsum.photos/id/1068/1200/900' },
  { out: 'assets/img/curated/athletes-hero.jpg', url: 'https://picsum.photos/id/1057/1600/900' },
  { out: 'assets/img/curated/governance-hero.jpg', url: 'https://picsum.photos/id/1048/1600/900' },
  { out: 'assets/img/curated/contact-hero.jpg', url: 'https://picsum.photos/id/1033/1600/900' },
  { out: 'assets/img/curated/about-history.jpg', url: 'https://picsum.photos/id/1027/1200/900' },
  { out: 'assets/img/curated/sports-page-1.jpg', url: 'https://picsum.photos/id/1020/1200/900' },
  { out: 'assets/img/curated/sports-page-2.jpg', url: 'https://picsum.photos/id/1015/1200/900' },
  { out: 'assets/img/curated/sports-page-3.jpg', url: 'https://picsum.photos/id/1013/1200/900' }
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchToFile(url, outFile, redirects = 0) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirects > 8) return reject(new Error('Too many redirects: ' + url));
        const nextUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        res.resume();
        return fetchToFile(nextUrl, outFile, redirects + 1).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
      }

      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      const file = fs.createWriteStream(outFile);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
      return undefined;
    }).on('error', reject);
  });
}

async function run() {
  for (const item of downloads) {
    await fetchToFile(item.url, item.out);
    const size = fs.statSync(item.out).size;
    console.log(item.out + ' ' + size);
    await wait(400);
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

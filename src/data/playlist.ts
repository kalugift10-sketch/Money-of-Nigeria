// The Money Playlist. Music plays through YouTube (no audio files are hosted here).
// To add a song: paste its YouTube video id (the part after "v=" in the link).
// cover: put an image in /public/covers and reference it here, e.g. "/covers/billionaire.jpg".
export type Song = { title: string; artist: string; youtubeId: string; cover?: string };

export const playlist: Song[] = [
  { title: "Billionaire", artist: "Stanley Okorie", youtubeId: "ARa7krXyXhA", cover: "/covers/ARa7krXyXhA.jpg" },
  { title: "Make We Jolly", artist: "Mama G", youtubeId: "YyLcazUAdqc", cover: "/covers/YyLcazUAdqc.jpg" },
  { title: "Too Much Money", artist: "Stanley Okorie", youtubeId: "j6yX1vPqHeo", cover: "/covers/j6yX1vPqHeo.jpg" },
  { title: "Money Good", artist: "Stanley Okorie", youtubeId: "QDYE9K4Xqrk", cover: "/covers/QDYE9K4Xqrk.jpg" },
  { title: "Yahooze", artist: "Olu Maintain", youtubeId: "zLNoUXRxpKc", cover: "/covers/zLNoUXRxpKc.jpg" },
  { title: "Time Na Money", artist: "Mike Okri", youtubeId: "NcBE2UH8WOc", cover: "/covers/NcBE2UH8WOc.jpg" },
];

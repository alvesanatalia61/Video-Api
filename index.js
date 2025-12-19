import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/process-video", (req, res) => {
  const { youtubeUrl, start = 0, duration = 30 } = req.body;

  if (!youtubeUrl) {
    return res.status(400).json({ error: "youtubeUrl é obrigatório" });
  }

  const id = Date.now();
  const input = `input-${id}.mp4`;
  const output = `output-${id}.mp4`;

  const command = `
    yt-dlp "${youtubeUrl}" -f mp4 -o ${input} &&
    ffmpeg -ss ${start} -i ${input} -t ${duration} -c copy ${output}
  `;

  exec(command, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao processar vídeo" });
    }

    res.download(output, () => {
      fs.unlinkSync(input);
      fs.unlinkSync(output);
    });
  });
});

app.listen(3000, () => {
  console.log("API de vídeo rodando");
});

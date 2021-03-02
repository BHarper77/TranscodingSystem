//TODO: Update Java code to transcode video when a RabbitMQ message is recieved

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;

public class ffmpegCommand
{
    static public void main (String[] args) throws IOException
    {
        String dir = "/user/home/videos";
        String command = "ffmpeg -i TestVideo1.avi -codec copy TestVideo1.mp4";

        Process process = Runtime.getRuntime().exec(command, null, new File(dir));

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line = "";

        while ((line = reader.readLine()) != null)
            System.out.println(line);
    }
}
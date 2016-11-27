using System;
using System.IO;
using System.Text;
using System.Drawing;
using System.Collections;
using Newtonsoft.Json;
using Microsoft.Extensions.Configuration;
using DzRepoLib;
using DzComposer;

namespace DzApp
{
    class Program
    {
        static string uploadsDir;
        static string imagesDir;
        static string outputDir;

        static void Main(string[] args)
        {
            Bitmap bitmap = null;
            string imageName = null;
            string format = null;

            Console.WriteLine("Image Pyramid Builder\nstarted...");

            try
            {
                var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("dzImagePyramidBuilderAppSettings.json", optional: true, reloadOnChange: true);
                var configuration = builder.Build();
                Config(configuration);

                var imageFilePath = args[0];
                var ss = imageFilePath.Split('\\', '/', '.', '-');
                imageName = ss[ss.Length - 3];
                format = ss[ss.Length - 2];
                var uploadedFilePath = ss.Length == 3 ? Path.Combine(uploadsDir, imageFilePath) : imageFilePath;
                Console.WriteLine("uploadedFilePath: {0}", uploadedFilePath);
                bitmap = new Bitmap(uploadedFilePath);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            if (bitmap != null)
            {
                try
                {
                    var currDir = Directory.GetCurrentDirectory();
                    Console.WriteLine("Working Directory: {0}", currDir);
                    Directory.SetCurrentDirectory(outputDir);

                    // Create the DeepZoom generator object and pass it the Access persister object
                    var dzg = new DeepZoomGenerator { Persister = new DzAccess(new DzRepo()) };
                    bool ok = dzg.CreateSingleDeepZoomImage(imageName, bitmap, true, true);

                    var image = new OuterImage
                    {
                        Image = new OuterImage.ClImage
                        {
                            Url = string.Format(@"{0}{1}\", imagesDir, imageName).Replace('\\', '/'),
                            Format = "jpg", //format,
                            Size = new OuterImage.ClImage.ClSize
                            {
                                Width = bitmap.Width.ToString(),
                                Height = bitmap.Height.ToString(),
                            },
                        }
                    };

                    bitmap.Dispose();

                    string jsonStr = null;

                    // Create JSON file
                    try
                    {
                        jsonStr = JsonConvert.SerializeObject(image);
                    }
                    catch (Exception e)
                    {
                    }

                    if (!string.IsNullOrEmpty(jsonStr))
                        File.WriteAllText(Path.Combine(outputDir, imageName, imageName + ".json"), jsonStr);                         

                    Directory.SetCurrentDirectory(currDir);

                    Console.WriteLine("...successfully ended.");
                }
                catch (Exception e)
                {
                }
            }
        }

        private static void Config(IConfiguration configuration)
        {
            var currDir = AdjustDelim(Directory.GetCurrentDirectory());
            Console.WriteLine("current dir: {0}", currDir);

            // Get root directory
            var ss = currDir.Split('/');
            int k = 0;
            var stack = new Stack();
            for (int i = ss.Length - 1; i >= 0; i--)
                if (!string.IsNullOrEmpty(ss[i]))
                {
                    k++;
                    if (k > 1)
                        stack.Push(ss[i]);
                }
          
            var sb = new StringBuilder();
            bool b = true;
            while (b)
            {
                string s = null;
                try
                {
                    s = stack.Pop() as string;
                }
                catch { }

                if (b = !string.IsNullOrEmpty(s))
                    sb.AppendFormat("{0}/", s);
            }

            Console.WriteLine("root dir: {0}", sb);

            try
            {
                uploadsDir = AdjustDelim(string.Format("{0}{1}", currDir, configuration.GetSection("Directories:uploadsDir").Value));
                Console.WriteLine("uploadsDir: {0}", uploadsDir);

                imagesDir = AdjustDelim(configuration.GetSection("Directories:imagesDir").Value);
                Console.WriteLine("imagesDir: {0}", imagesDir);

                outputDir = AdjustDelim(string.Format("{0}{1}", sb.ToString(), configuration.GetSection("Directories:outputDir").Value));
                Console.WriteLine("outputDir: {0}", outputDir);
            }
            catch (Exception e)
            {
                Console.WriteLine("Wrong Dir Exception: {0}", e);
            }
        }

        static string AdjustDelim(string s)
        {
            return s.Replace('\\', '/').Replace("//", "/");
        }
    }
    
    class OuterImage
    {
        public class ClImage
        {
            public string xmlns = "http://schemas.microsoft.com/deepzoom/2008";
            public string Url;
            public string Format;
            public string Overlap = "1";
            public string TileSize = "256";
            public class ClSize
            {
                public string Height;
                public string Width;
            }

            public ClSize Size;
        }

        public ClImage Image;
    }
}

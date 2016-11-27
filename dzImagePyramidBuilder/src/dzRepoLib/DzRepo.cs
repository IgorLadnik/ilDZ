using System;
using System.IO;

namespace DzRepoLib
{
    public class DzRepo
    {
        public void StringToFile(string filepath, string info)
        {

        }

        public bool StreamToFile(string filePath, Stream ms)
        {
            if (!RemoveFile(filePath))
                return false;

            CreatePath(filePath);

            try
            {
                var buffer = new byte[ms.Length];
                ms.Read(buffer, 0, (int)ms.Length);

                var fs = new FileStream(filePath, FileMode.CreateNew, FileAccess.Write);
                fs.Write(buffer, 0, buffer.Length);
                fs.Dispose(); //.Close();

                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        private static void CreatePath(string filePath)
        {
            var currDir = Directory.GetCurrentDirectory();
            foreach (var dir in Path.GetDirectoryName(filePath).Split(Path.DirectorySeparatorChar))
            {
                var nestedDir = Path.Combine(currDir, dir);
                if (!Directory.Exists(nestedDir))
                    Directory.CreateDirectory(nestedDir);

                currDir = nestedDir;
            }
        }

        private static bool RemoveFile(string filePath)
        {
            bool br = true;
            if (File.Exists(filePath))
            {
                try
                {
                    File.Delete(filePath);
                }
                catch (Exception e)
                {
                    br = false;
                }
            }

            return br;
        }
    }
}

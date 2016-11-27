//
// Based on prior work done by Lutz Gerhard, Peter Blois, Scott Hanselman, Joerg Lang (list is not exhaustive)
//
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using DzRepoLib;

namespace DzComposer
{
    public class DzAccess : IDzPersistance
    {
        const string IMAGE_INFO_TEMPLATE =
            "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
            "<Image TileSize=\"{0}\" Overlap=\"{1}\" Format=\"{2}\" ServerFormat=\"Default\" xmlns=\"http://schemas.microsoft.com/deepzoom/2009\">" +
            "<Size Width=\"{3}\" Height=\"{4}\" />" +
            "</Image>";

        private DzRepo _blobContainer;

        public DzAccess(DzRepo blobContainer)
        {
            _blobContainer = blobContainer;
        }

        public void SaveImageInfo(string imageName, int width, int height, int tileSize, int overlap, string mimeType)
        {
            _blobContainer.StringToFile(imageName + ".xml", string.Format(IMAGE_INFO_TEMPLATE, tileSize, overlap, "jpg", width, height));
        }

        public void SaveImageTile(string imageName, int level, int x, int y, Bitmap bitmap)
        {
            try
            {
                MemoryStream ms = new MemoryStream();
                bitmap.Save(ms, ImageFormat.Jpeg);
                ms.Position = 0;
                _blobContainer.StreamToFile(string.Format("{0}/{1}/{2}_{3}.jpg", imageName, level, x, y), ms);
            }
            catch
            {
            }
        }
    }
}

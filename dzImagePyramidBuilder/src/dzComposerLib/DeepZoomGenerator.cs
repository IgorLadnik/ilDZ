//
// Based on prior work done by Lutz Gerhard, Peter Blois, Scott Hanselman, Joerg Lang (list is not exhaustive)
//
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace DzComposer
{
    /// <summary>
    /// DeepZoom encapsulates code used to generate a DeepZoom image from a
    /// single image. This class does not contain any Windows Forms related or user
    /// interface code. 
    /// </summary>
    public class DeepZoomGenerator
    {
        /// <summary>
        /// Occurs when the creation of the deep zoom image progresses.
        /// </summary>
        //public event EventHandler<DeepZoomCreationProgressEventArgs> CreationProgress;

        /// <summary>Overlap in pixels for DeepZoom image tiles</summary>
        internal const int tileOverlap = 1;
        internal const int maxThumbnailWidth = 125;

        private ImageCodecInfo jpegCodec;
        
        /// <summary>
        /// Gets or sets the database persister.
        /// </summary>
        /// <value>The database persister.</value>
        public IDzPersistance Persister { get; set; }

        /// <summary>JPEG quality used for jpg image tiles, must be between 1 and 100</summary>
        public int JpegQuality { get; set; }

        /// <summary>PixelFormat used in memory bitmaps</summary>
        public PixelFormat ColorPixelFormat { get; set; }

        /// <summary>PixelFormat used in memory bitmaps</summary>
        public int TileSize { get; set; }

 
        /// <summary>
        /// Initializes a new instance of the <see cref="DeepZoomGenerator"/> class with 
        /// default values for jpeg quality (90), tile size (256) and a color format
        /// of 24bppRgb.
        /// </summary>
        public DeepZoomGenerator(): this(90, 256, System.Drawing.Imaging.PixelFormat.Format24bppRgb)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DeepZoomGenerator"/> class.
        /// </summary>
        /// <param name="jpegQuality">The JPEG quality. Integer values from 0 to 100</param>
        /// <param name="tileSize">Size of the tiles.</param>
        /// <param name="colorPixelFormat">The pixel format.</param>
        public DeepZoomGenerator(int jpegQuality, int tileSize, PixelFormat colorPixelFormat)
        {
            JpegQuality = jpegQuality;
            TileSize = tileSize;
            ColorPixelFormat = colorPixelFormat;
        }

        /// <summary>
        /// Creates the DeepZoom image tile set for one image.
        /// </summary>
        /// <param name="imageName">Name of the image.</param>
        /// <param name="bitmap">The bitmap.</param>
        /// <param name="useJpeg">true if color images (jpg) should be written</param>
        /// <param name="useOverlap">if set to <c>true</c> tiles will be created a one pixel overlap.</param>
        /// <returns>The id of the image in the database</returns>
        public bool CreateSingleDeepZoomImage(string imageName, Bitmap bitmap, bool useJpeg, bool useOverlap)
        {
            bool ok = true;
            int maxLevel = CalcMaxLevel(bitmap.Width, bitmap.Height);
            int width = bitmap.Width;
            int height = bitmap.Height;
            double progressStep = (double) 100 / maxLevel;
            double progress = 0;
            int overlap = useOverlap ? tileOverlap : 0;

            // Create a thumbnail to store in the db as a preview
            //Bitmap thumbnail = new Bitmap(bitmap, maxThumbnailWidth, bitmap.Height / (bitmap.Width / maxThumbnailWidth));

            // Persist the image info in the database
            Persister.SaveImageInfo(imageName, width, height, TileSize, overlap, GetMimeType(useJpeg) /*, thumbnail*/);

            for (int level = maxLevel; level >= 0; level--)
            {
                bool outOfMemory;
                CreateTiles(bitmap, imageName, level, width, height, useJpeg, useOverlap, out outOfMemory);
                
                if (ok)
                    ok = !outOfMemory;
                
                width = (width / 2);
                height = (height / 2);
                progress += progressStep;

                //OnDeepZoomCreationProgress(new DeepZoomCreationProgressEventArgs((int) progress));
            }

            //return imageId;
            return ok;
        }

        ///// <summary>
        ///// Raises the DeepZoomCreationProgress event.
        ///// </summary>
        ///// <param name="e">The <see cref="DbDzComposer.DeepZoomCreationProgressEventArgs"/> instance containing the event data.</param>
        //private void OnDeepZoomCreationProgress(DeepZoomCreationProgressEventArgs e)
        //{
        //    // To prevent race conditions assign it to a variable and raise the event from there
        //    EventHandler<DeepZoomCreationProgressEventArgs> handler = CreationProgress;
        //    if (handler != null)
        //    {
        //        handler(this, e);
        //    }
        //}


        /// <summary>
        /// Creates a tile set for the specified bitmap and level. The caller should calculate
        /// and pass on the zoom width and height for for the level.
        /// </summary>
        /// <param name="bitmap">Original bitmap</param>
        /// <param name="imageId">The image id.</param>
        /// <param name="level">Level</param>
        /// <param name="width">overall width of the image to be used for specified zoom level</param>
        /// <param name="height">overall height of the image to be used for specified zoom level</param>
        /// <param name="useJpeg">true if color image (should generate jpg)</param>
        /// <param name="useOverlap">true to generate overlapped tiles (deepzoom images), false for fixed 256x256 tiles (collection thumbnails)</param>
        /// <returns>Count of generated tiles</returns>
        internal int CreateTiles(Bitmap bitmap, string imageName, int level, int width, int height, bool useJpeg, bool useOverlap, 
                                   out bool outOfMemory)
        {
            int tilesCount = 0;
            outOfMemory = false;

            // Make sure we have valid height and width
            if (width < 1) width = 1;
            if (height < 1) height = 1;

            bool useSmoothScaling = useOverlap && (width < bitmap.Width || height < bitmap.Height);
            using (var scaledBitmap = new EditableBitmap(bitmap, ColorPixelFormat, width, height, useSmoothScaling))
            {
                outOfMemory = scaledBitmap.OutOfMemory;

                for (int x = 0, iX = 0; x < width; x += TileSize, iX++)
                {
                    int left;
                    int tileWidth = GetTileSize(x, width, out left, useOverlap);
                    for (int y = 0, iY = 0; y < height; y += TileSize, iY++)
                    {
                        int top;
                        int tileHeight = GetTileSize(y, height, out top, useOverlap);
                        var rectTile = new Rectangle(left, top, tileWidth, tileHeight);
                        string outputFile = iX + "_" + iY + (useJpeg ? ".jpg" : ".png");
                        using (EditableBitmap tileBitmap = scaledBitmap.CreateView(rectTile))
                        {
                            if (!useOverlap && (tileWidth < TileSize || tileHeight < TileSize))
                            {
                                // Collection thumbnail tiles are always the tilesize in minimum, even if the image content
                                // is much smaller. Draw a smaller image on top of a black TileSize x TileSize image.
                                using (var bmExtended = new Bitmap(TileSize, TileSize, tileBitmap.Bitmap.PixelFormat))
                                {
                                    using (Graphics gfx = Graphics.FromImage(bmExtended))
                                    {
                                        gfx.FillRectangle(Brushes.Black, 0, 0, TileSize, TileSize);
                                        gfx.DrawImage(tileBitmap.Bitmap, 0, 0);
                                    }
                                    SaveTile(bmExtended, imageName, level, iX, iY, JpegQuality, useJpeg);
                                }
                            }
                            else
                                SaveTile(tileBitmap.Bitmap, imageName, level, iX, iY, JpegQuality, useJpeg);
                        }
                        tilesCount++;
                    }
                }
            }

            return tilesCount;
        }


        /// <summary>
        /// Returns the maximum tile level for the given image dimensions.
        /// </summary>
        /// <param name="width">Image width in pixels</param>
        /// <param name="height">Image height in pixels</param>
        /// <returns>Maximum DeepZoom tile level for the image</returns>
        internal static int CalcMaxLevel(int width, int height)
        {
            int iDimension = Math.Max(width, height);
            return Convert.ToInt32(Math.Ceiling(Math.Log(iDimension) / Math.Log(2)));
        }

        /// <summary>
        /// Helper function to get tile coordinates. DeepZoom uses tiles that have a net
        /// size of 256 x 256, but have an overlap of 1 pixel on all sides. Tiles at the 
        /// border of the image are slightly smaller (e.g., 257 x 258) than tiles in the 
        /// middle (258 x 258).
        /// 
        /// Collection thumbnails do not use overlap but have tiles that are always exactly
        /// 256 x 256. For the non-overlap case Getc_tileSize will still truncate to the 
        /// image border, it returns the exact rectangle of the source image to be copied.
        /// </summary>
        /// <param name="start">Net start coordinate</param>
        /// <param name="max">Maximum coordinate in image</param>
        /// <param name="actualStart">OUT: Actual start coordinate can be 1 pixel below iStart</param>
        /// <param name="useOverlap">true to use overlap</param>
        /// <returns>Actual tile size</returns>
        internal int GetTileSize(int start, int max, out int actualStart, bool useOverlap)
        {
            int ic_tileSize;
            if (useOverlap)
            {
                ic_tileSize = TileSize + tileOverlap;
                actualStart = start;
                if (start > 0)
                {
                    ic_tileSize += tileOverlap;
                    actualStart -= tileOverlap;
                }
            }
            else
            {
                actualStart = start;
                ic_tileSize = TileSize;
            }
            if (actualStart + ic_tileSize > max)
                ic_tileSize = (max - actualStart);
            if (ic_tileSize < 1)
                ic_tileSize = 1;
            return ic_tileSize;
        }

        /// <summary>
        /// SaveTile is used to save a tile bitmap, either as jpg (bUseJpeg == true) or
        /// as png (bUseJpeg == false).
        /// </summary>
        /// <param name="bitmap">Bitmap to be saved</param>
        /// <param name="level">The level.</param>
        /// <param name="imageId">The image id.</param>
        /// <param name="x">The x coordinates of the image</param>
        /// <param name="y">The y coordinates of the image</param>
        /// <param name="quality">Quality (only used for jpg)</param>
        /// <param name="useJpeg">true: save jpg format; false: save png format</param>
        internal void SaveTile(Bitmap bitmap, string imageName, int level, int x, int y, long quality, bool useJpeg)
        {           
            MemoryStream memStream = new MemoryStream();
            if (useJpeg)
            {
                // Encoder parameter for image quality
                var qualityParam = new EncoderParameter(Encoder.Quality, quality);

                // Jpeg image codec
                if (jpegCodec == null)
                    jpegCodec = GetEncoderInfo(GetMimeType(true));

                if (jpegCodec == null)
                    return;

                var encoderParams = new EncoderParameters(1);
                encoderParams.Param[0] = qualityParam;

                // Create a new bitmap according to the users quality settings
                bitmap.Save(memStream, jpegCodec, encoderParams);
                Bitmap bmp = new Bitmap(memStream);

                // Save the jpge to the database
                Persister.SaveImageTile(imageName, level, x, y, bmp);
            }
            else
            {
                bitmap.Save(memStream, ImageFormat.Png);
                Bitmap bmp = new Bitmap(memStream);

                // Save the png to the database
                Persister.SaveImageTile(imageName, level, x, y, bmp);
            }
        }

        /// <summary>
        /// Helper function that returns the mime type for either jpeg or png
        /// </summary>
        /// <param name="useJpeg">if set to <c>true</c> [use JPEG].</param>
        /// <returns></returns>
        private string GetMimeType(bool useJpeg)
        {
            return useJpeg ? "image/jpeg" : "image/png";
        }

        /// <summary>
        /// Helper function that is used to locate the jpeg codec used in GDI+.
        /// </summary>
        /// <param name="mimeType">Mime type for which codec must be located</param>
        /// <returns></returns>
        private static ImageCodecInfo GetEncoderInfo(string mimeType)
        {
            // Get image codecs for all image formats
            ImageCodecInfo[] codecs = ImageCodecInfo.GetImageEncoders();

            // Find the correct image codec
            for (int i = 0; i < codecs.Length; i++)
                if (codecs[i].MimeType == mimeType)
                    return codecs[i];
            return null;
        }
    }

    /// <summary>
    /// Provides data for the DeepZoomCreationProgress. 
    /// </summary>
    public class DeepZoomCreationProgressEventArgs : EventArgs
    {
        private readonly int m_creationProgress;
        public int CreationProgress
        {
            get { return m_creationProgress; }
        }

        public DeepZoomCreationProgressEventArgs(int percentage)
        {
            if (percentage > 100)
                percentage = 100;
            m_creationProgress = percentage;
        }
    }
}
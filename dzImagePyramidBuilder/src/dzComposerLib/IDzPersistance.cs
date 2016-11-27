// 
// This source code is licensed for commercial and non-commercial use under the 
// Code Project Open License (CPOL) 1.02  http://www.codeproject.com/info/cpol10.aspx
// Developer: Joerg Lang (lang.joerg@gmail.com)
//  
using System.Drawing;

namespace DzComposer
{
    public interface IDzPersistance
    {
        void SaveImageInfo(string imageName, int width, int height, int tileSize, int overlap, string mimeType);
        void SaveImageTile(string imageName, int level, int x, int y, Bitmap bitmap);
    }
}
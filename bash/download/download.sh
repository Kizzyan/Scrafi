#! /bin/sh

ytb="yt-dlp -f bestaudio -x --audio-format mp3 --audio-quality 320k --parse-metadata 'playlist_index:%(track_number)s' --add-metadata --postprocessor-args '-id3v2_version 3'"
path="$ALX_PATH/.crawler/bash/download/"
download_path="/media/extra/Music"

url=$(rofi -dmenu -i -p "󰀥 " -theme-str '@import "'$path'/search.rasi"')
if [ -n "$url" ]; then
  json=$(node $ALX_PATH/.crawler/typescript/dist/download.js "$url")
  artist=$(echo "$json" | jq -r '.artistName')
  album=$(echo "$json" | jq -r '.albumName')
fi

echo $artist
echo $album

if [ -n "$url" ]; then
  if [ ! -d "$download_path/$artist" ]; then
    cd $download_path
    mkdir "$artist"
    cd "$artist"
    mkdir "$album"
    cd "$album"
    yt-dlp -f bestaudio -x --audio-format mp3 --audio-quality 320k --parse-metadata 'playlist_index:%(track_number)s' --add-metadata --postprocessor-args '-id3v2_version 3' $url
  else
    cd $download_path/$artist
    mkdir "$album"
    cd "$album"
    yt-dlp -f bestaudio -x --audio-format mp3 --audio-quality 320k --parse-metadata 'playlist_index:%(track_number)s' --add-metadata --postprocessor-args '-id3v2_version 3' $url
  fi
fi

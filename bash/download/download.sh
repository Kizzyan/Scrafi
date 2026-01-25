#! /bin/sh

export PATH=/usr/local/bin:/usr/bin:/bin
export DISPLAY=:0
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
path="$ALX_PATH/.scrafi/bash/download/"

selected=$(printf "󰇚\n󰧩" | rofi -dmenu -i -theme-str '@import "'$path'/download_1.rasi"')
case "$selected" in
  "󰇚")
    batch=false
    ;;
  "󰧩")
    batch=true
    ;;
  *)
    exit 1
    ;;
esac

url=$(rofi -dmenu -i -p "󰀥 " -theme-str '@import "'$path'/download_2.rasi"')
if [ -n "$url" ]; then
  json=$(node "$ALX_PATH"/.scrafi/typescript/scripts/dist/download.js "$url" $batch)
  if $batch; then
    artist=$(echo "$json" | jq -r '.artistName')
    albums=$(echo "$json" | jq -r '.albums')
  else
    artist=$(echo "$json" | jq -r '.artistName')
    album=$(echo "$json" | jq -r '.albumName')
    year=$(echo "$json" | jq -r '.albumYear')
  fi
fi

download () {
  if [ ! -d "$DOWNLOAD_PATH/$1" ]; then
    cd "$DOWNLOAD_PATH" || return
    mkdir "$1"
    cd "$1" || return
    mkdir "$2"
    cd "$2" || return
  else
    cd "$DOWNLOAD_PATH/$1" || return
    mkdir "$2"
    cd "$2" || return
  fi
  yt-dlp -f bestaudio -x --audio-format mp3 --audio-quality 320k --parse-metadata "playlist_index:%(track_number)s" --add-metadata --postprocessor-args "ffmpeg:-metadata year=$3 -metadata date=$3 -metadata TYER=$3 -id3v2_version 3" "$4"
}

if [ -n "$url" ]; then
  if $batch; then
    echo "$albums" | jq -r '.[] | [.name, .url, .year] | @tsv' | while IFS=$'\t' read -r albumName albumUrl albumYear; do
    download "$artist" "$albumName" "$albumYear" "https://music.youtube.com/$albumUrl"
  done
else
  download "$artist" "$album" "$year" "$url"
  fi
fi

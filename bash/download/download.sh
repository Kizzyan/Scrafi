#! /bin/sh

PATH="$HOME/.local/bin:$PATH"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

# Dependency check
for cmd in yt-dlp rofi node jq; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: $cmd is not installed" >&2
    exit 1
  fi
done

base_path="$HOME/.scrafi/bash/download"

selected=$(printf "󰇚\n󰧩" | rofi -dmenu -i -theme-str '@import "'$base_path'/download_1.rasi"')
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

url=$(rofi -dmenu -i -p "󰀥 " -theme-str '@import "'$base_path'/download_2.rasi"')
if [ -n "$url" ]; then
  json=$(node "$HOME"/.scrafi/typescript/scripts/dist/download.js "$url" $batch)
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
  local target_dir="$DOWNLOAD_PATH/$1/$2"
  mkdir -p "$target_dir"
  cd "$target_dir" || return

  yt-dlp -f bestaudio -x \
    --cookies /media/extra/Music/cookies.txt \
    --js-runtimes node \
    --remote-components ejs:github \
    --audio-format mp3 \
    --audio-quality 320k \
    --parse-metadata "playlist_index:%(track_number)s" \
    --add-metadata \
    --postprocessor-args "ffmpeg:-metadata year=$3 -metadata date=$3 -metadata TYER=$3 -id3v2_version 3" \
    "$4"

  beet import -q "$target_dir"
}

if [ -n "$url" ]; then
  if $batch; then
    echo "$albums" | jq -r '.[] | [.name, .url, .year] | @tsv' | while IFS=$'\t' read -r albumName albumUrl albumYear; do
    download "$artist" "$albumName" "$albumYear" "https://music.youtube.com/$albumUrl"
    sleep 2
  done
else
  download "$artist" "$album" "$year" "$url"
  fi
fi

notify-send "All downloads finished!"

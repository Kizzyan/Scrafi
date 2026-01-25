#! /bin/sh

export PATH=/usr/local/bin:/usr/bin:/bin
export DISPLAY=:0

base_path=$ALX_PATH/.scrafi
selected=$(printf "󰜏\n󰸕\n󰚰\n󰦗" | rofi -dmenu -i -theme-str '@import "'$base_path'/select.rasi"')

case "$selected" in
"󰸕")
  /bin/bash "$base_path/bash/bookmark/bookmark.sh"
  ;;
"󰜏")
  /bin/bash "$base_path/bash/search/search.sh"
  ;;
"󰚰")
  /bin/bash "$base_path/bash/update/update.sh"
  ;;
"󰦗")
  /bin/bash "$base_path/bash/download/download.sh"
  ;;
*)
  exit 1
  ;;
esac

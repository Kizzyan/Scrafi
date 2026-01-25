#! /bin/sh

export PATH=/usr/local/bin:/usr/bin:/bin
export DISPLAY=:0

base_path=$ALX_PATH/.crawler/bash/
selected=$(printf "󰜏\n󰸕\n󰚰\n󰭽" | rofi -dmenu -i -theme-str '@import "/home/yan/Archive/Notas/Alexandryte/.crawler/select.rasi"')

case "$selected" in
"󰸕")
  /bin/bash "$base_path/bookmark/bookmark.sh"
  ;;
"󰜏")
  /bin/bash "$base_path/search/search.sh"
  ;;
"󰚰")
  /bin/bash "$base_path/update/update.sh"
  ;;
"󰭽")
  /bin/bash "$base_path/download/download.sh"
  ;;
*)
  exit 1
  ;;
esac

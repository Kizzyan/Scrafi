#! /bin/sh

path="$HOME/.scrafi/bash/search/"
selected=$(printf "󰇥\n󰥷\n󰖬\n󰗃\n\n\n󰿏\n󰵻\n\n\n󰀥\n\n\n\n󰬉\n󰒚\n\n" | rofi -dmenu -i -theme-str '@import "'$path'/search_2.rasi"')

case "$selected" in
"󰇥")
  search_url="https://duckduckgo.com/?q="
  icon=" 󰇥 "
  params=""
  ;;
"󰥷")
  search_url="http://www.google.com/search?q="
  icon=" 󰥷 "
  params="&sclient=img&udm=2"
  ;;
"󰗃")
  search_url="https://www.youtube.com/results?search_query="
  icon="  "
  params=""
  ;;
"󰖬")
  search_url="https://en.wikipedia.org/wiki/"
  icon="  "
  params=""
  ;;
"")
  search_url="https://mangadex.org/search?q="
  icon="  "
  params="&sort=Best+Match&order=Descending&official=Any&anime=Any&adult=Any&display_mode=Full+Display"
  ;;
"")
  search_url="https://weebcentral.com/search?text="
  icon="  "
  params=""
  ;;
"󰿏")
  search_url="https://letterboxd.com/search/"
  icon=" 󰿏 "
  params=""
  ;;
"󰵻")
  search_url="https://www.goodreads.com/search?utf8=%E2%9C%93&query="
  icon=" 󰵻 "
  params=""
  ;;
"")
  search_url="https://anilist.co/search/anime?search=="
  icon="  "
  params=""
  ;;
"")
  search_url="https://www.amazon.com.br/s?k="
  icon="  "
  params=""
  ;;
"")
  search_url="https://store.steampowered.com/search/?term="
  icon="  "
  params=""
  ;;
"")
  search_url="https://lista.mercadolivre.com.br/"
  icon="  "
  params=""
  ;;
"")
  search_url="https://www.imdb.com/find/?q="
  icon="  "
  params=""
  ;;
"")
  search_url="https://www.themoviedb.org/search?query="
  icon="  "
  params=""
  ;;
"󰀥")
  search_url="https://www.albumoftheyear.org/search/?q="
  icon=" 󰀥 "
  params=""
  ;;
"󰬉")
  search_url="https://backloggd.com/search/games/"
  icon=" 󰬉 "
  params=""
  ;;
"󰒚")
  search_url="https://pt.aliexpress.com/w/wholesale-"
  icon=" 󰒚 "
  params=".html?spm=a2g0o.home.search.0"
  ;;
"")
  search_url="https://gg.deals/search/?title="
  icon="  "
  params=""
  ;;
*)
  exit 1
  ;;
esac

query=$(rofi -dmenu -i -p "$icon " -theme-str '@import "'$path'/search_1.rasi"')

if [ -n "$query" ]; then
  flatpak run app.zen_browser.zen "${search_url}${query}${params}"
fi

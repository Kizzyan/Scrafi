#! /bin/bash

path="$HOME/.scrafi/bash/bookmark/calendar/"
date_array=()

for i in $(seq 0 6); do
  result=$(date '+%d/%m' -d "-$i days")
  date_array+=("$result") # Add to array
done

date_options=$(printf "%s\n" "${date_array[@]}")
selected=$(printf "%s" "$date_options" | rofi -dmenu -i -theme-str '@import "'$path'/calendar.rasi"')

for i in $(seq 0 6); do
  if [[ "$selected" == ${date_array[$i]} ]]; then
    echo $(date +"%Y-%m-%d" -d "-$i days")
    exit 0
  fi
done

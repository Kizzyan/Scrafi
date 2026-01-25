#! /bin/sh

export PATH=/usr/local/bin:/usr/bin:/bin
export DISPLAY=:0
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
path="$ALX_PATH"

start=$(($(find ${path}/Alexandryte.md -type f | xargs grep -n '## :LiEye: Following' | cut -c 1-3) + 2))
finish=$(($(find ${path}/Alexandryte.md -type f | xargs grep -n '## :LiCheckSquare: Finished' | cut -c 1-3) - 3))
update_count=0

for i in $(seq $start $finish); do
  current=$(sed "$i!d" $path/Alexandryte.md)
  file=$path/Notes/$(echo $current | sed -n 's/.*\[\[\([^]]*\)\]\].*/\1/p').md
  url=$(sed "4!d" "$file" | sed -n 's/.*(\([^)]*\)).*/\1/p')
  current_total=$(sed "5!d" "$file" | sed 's/.*: //')
  title=$(sed "2!d" "$file" | sed 's/.*: //')
  if [ -n "$url" ]; then
    json=$(node $path/.scrafi/typescript/scripts/dist/update.js "$url")
    new_total=$(echo "$json" | jq -r '.total')
    if [[ $current_total != $new_total ]]; then
      sed -i "5s/.*/Total: $new_total/" "$file"
      notify-send "$title updated!" "New chapter: $new_total!"
      ((update_count+=1))
    fi
  fi
done

if [[ $update_count -eq 0 ]]; then
  notify-send "Everything already up to date!"
else
  notify-send "$update_count files updated!"
fi

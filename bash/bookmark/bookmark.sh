#! /bin/sh

export PATH=/usr/local/bin:/usr/bin:/bin
export DISPLAY=:0
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
path="$ALX_PATH"

define_placeholder() {
  placeholder="$1"
  echo "window {height: 65px; width: 20%; border-radius: 20px;} entry { placeholder: \"$placeholder\"; }"
}

url=$(rofi -dmenu -i -p "󰃀 " -theme-str "$(define_placeholder 'Add Bookmark')")
if [ -n "$url" ]; then
  json=$(node $ALX_PATH/.scrafi/typescript/scripts/dist/bookmark.js "$url")
  title=$(echo "$json" | jq -r '.title')
  creator=$(echo "$json" | jq -r '.creator')
  img_url=$(echo "$json" | jq -r '.img')
  total=$(echo "$json" | jq -r '.total')
  category=$(echo "$json" | jq -r '.category')
  # domain=$(echo "$json" | jq -r '.domain')
  year=$(echo "$json" | jq -r '.year')
  cleaned_title=$(echo "$json" | jq -r '.imgName')
  img_title=$([ -z "$img_url" ] && echo "AO3_logo.png" || echo "${cleaned_title}.jpg")
  comment=$(rofi -dmenu -i -p "󰅺 " -theme-str "$(define_placeholder 'Add a comment')")
  declare -a tags=($(echo "$json" | jq -r '.tags | @sh' | tr -d \'))
fi

base_filename="$ALX_PATH/Notes/$(echo "$title" | sed -r 's/[\/]+/ /g') (${year}).md"

if [ -f "$base_filename" ]; then
  filename="$ALX_PATH/Notes/${title}_${year}_(${category}).md"
else
  filename="$base_filename"
fi

cat >"$filename" <<EOF
---
Title: "${title}"
Creator: "${creator}"
Year: ${year}
Link: "${url}"
Total: ${total}
Curent: 0
Comment: "${comment}"
Drop:
Status: Not Started
Completed:
Image: "[[${img_title}]]"
Category: ${category}
tags:
$(for tag in "${tags[@]}"
do
echo -e "  - $tag"
done)
---
EOF

case "$img_title" in
"AO3_logo.png") echo "" ;;
*)
  cd "$ALX_PATH/Media" || exit
  filename="${img_title%.*}.jpg"
  wget -O "$filename" "${img_url}"
  ;;
esac

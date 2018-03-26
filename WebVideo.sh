#!/bin/bash
# usage examples (config.json contains fallback values for network, device, name1, name2)
# [NAME1=<name1> NAME2=<name2>] ./WebVideo.sh <url1> <url2> [<network> <device>]
# [NAME1=<name1> NAME2=<name2> URL1=<url1> URL2=<url2> DEVICE=<device> NETWORK=<network>] ./WebVideo.sh

echo
SETTINGS=$(jq -r '.generalSettings' ./config.json)
URL1=${1:-$URL1}

if [ ! $COMPARE_OFF ]; then
	# comparison enabled
	URL2=${2:-$URL2}
	NETWORK=${3:-${NETWORK:-$(echo $SETTINGS | jq -r '.defaultNetwork')}}
	DEVICE=${4:-${DEVICE:-$(echo $SETTINGS | jq -r '.defaultDevice')}}
else
	# comparison disabled
	NETWORK=${2:-${NETWORK:-$(echo $SETTINGS | jq -r '.defaultNetwork')}}
	DEVICE=${3:-${DEVICE:-$(echo $SETTINGS | jq -r '.defaultDevice')}}
fi

NAME1=${NAME1:-$(echo $SETTINGS | jq -r '.defaultIdentifier1')}
NAME2=${NAME2:-$(echo $SETTINGS | jq -r '.defaultIdentifier2')}
IMAGES=$(echo $SETTINGS | jq -r '.imagePath')
VIDEOS=$(echo $SETTINGS | jq -r '.videoPath')

echo "        WebVideo Tool        "
echo "============================="
echo " * URL1: $URL1"
echo " * URL2: $URL2"
echo " * NETWORK: $NETWORK"
echo " * DEVICE: $DEVICE"
echo "============================="
echo

mkdir -p $IMAGES
mkdir -p $VIDEOS

# remove files from image and video directory
function cleanup() {
	pkill -f google
	rm $IMAGES/*
	rm $VIDEOS/*
}

# kill chrome processes if still running
function clearProcesses() {
	pkill -f google
}

# create comparison video using ffmpeg commandline
# @param 1 first videoname
# @param 2 second videoname
function compareVideos() {
	ffmpeg \
   -i $VIDEOS/$1.mp4 \
   -i $VIDEOS/$2.mp4 \
   -filter_complex '[0:v:0]pad=(iw*2)+8:ih:color=black[bg]; [bg][1:v:0]overlay=w+8' \
   $VIDEOS/final.mp4
}

# check protocol url1
if [[ ! $URL1 =~ ^https?:// ]]; then
	URL1=http://${URL1}
	echo "Kein Protokoll angegeben. Es wird http:// verwendet: ${URL1}"
fi

cleanup
clearProcesses

# process URL1
node src/FrameCollector.js $NAME1 $URL1 $NETWORK $DEVICE
node src/VideoCreator.js $NAME1

clearProcesses

# process URL2 and comparison
if [[ ! $COMPARE_OFF  ]]; then

	# check protocol url2
	if [[ ! $URL2 =~ ^https?:// ]]; then
		URL2=http://${URL2}
		echo "Kein Protokoll angegeben. Es wird http:// verwendet: ${URL2}"
	fi

	node src/FrameCollector.js $NAME2 $URL2 $NETWORK $DEVICE
	node src/VideoCreator.js $NAME2

	# make video comparison
	compareVideos $NAME1 $NAME2 > /dev/null 2>&1

	echo
	if [[ -e $VIDEOS/final.mp4 ]]; then
		echo "The final video was saved to $VIDEOS/final.mp4"
		echo "Have fun watching! :)"
	else
		echo "An error occured while creating the video comparison.."
	fi
fi

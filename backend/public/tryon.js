const video = document.getElementById("video")
const shirt = document.getElementById("shirt")
const pants = document.getElementById("pants")

// chỉnh áo
let shirtOffsetX = 0
let shirtOffsetY = 0
let shirtScale = 1

// chỉnh quần
let pantsOffsetX = 0
let pantsOffsetY = 0
let pantsScale = 1

// drag control
let draggingItem = null
let startX = 0
let startY = 0

shirt.style.display = "none"
pants.style.display = "none"

// mở camera
navigator.mediaDevices.getUserMedia({video:true})
.then(stream=>{
video.srcObject = stream
})

// load sản phẩm
fetch("/api/products")
.then(res=>res.json())
.then(products=>{

const list = document.getElementById("productList")

products.forEach(p=>{

const div = document.createElement("div")
div.className = "product"

div.innerHTML = ` <img src="images${p.image}">

<p>${p.name}</p>
`

div.onclick = ()=>{

// áo
if(
p.category==="aokhoac"||
p.category==="aolen"||
p.category==="aothun"||
p.category==="aosomi"||
p.category==="aopolo"||
p.category==="vay"||
p.category==="bodonam"
){
shirt.src="images"+p.image
shirt.style.display="block"
}

// quần
if(
p.category==="quankaki"||
p.category==="quanshort"
){
pants.src="images"+p.image
pants.style.display="block"
}

}

list.appendChild(div)

})

})

// ===== Pose AI =====

const pose = new Pose({
locateFile:(file)=>{
return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
}
})

pose.setOptions({
modelComplexity:0,
smoothLandmarks:true,
minDetectionConfidence:0.5,
minTrackingConfidence:0.5
})

pose.onResults(results=>{

if(!results.poseLandmarks) return

const lm = results.poseLandmarks

const leftShoulder = lm[11]
const rightShoulder = lm[12]
const leftHip = lm[23]
const rightHip = lm[24]
const rightKnee = lm[26]

const videoWidth = video.clientWidth
const videoHeight = video.clientHeight

// ===== ÁO =====

const x1 = leftShoulder.x * videoWidth
const y1 = leftShoulder.y * videoHeight

const x2 = rightShoulder.x * videoWidth
const y2 = rightShoulder.y * videoHeight

// trung tâm vai
const centerX = (x1 + x2) / 2

// độ rộng vai
const shoulderWidth = Math.abs(x2 - x1)

// góc xoay áo
const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI

let width = shoulderWidth * 3.7

let shoulderY = y1
let hipY = leftHip.y * videoHeight

let height = hipY - shoulderY + 80

width *= shirtScale
height *= shirtScale

shirt.style.width = width + "px"
shirt.style.height = height + "px"

shirt.style.left = (centerX - width/2 + shirtOffsetX) + "px"
shirt.style.top = (shoulderY - height*0.25 + shirtOffsetY) + "px"

// xoay theo vai
shirt.style.transform = "rotate(0deg)"

// ===== QUẦN =====

// 2 hông
const hipX1 = leftHip.x * videoWidth
const hipX2 = rightHip.x * videoWidth

const hipCenter = (hipX1 + hipX2) / 2
const hipWidth = Math.abs(hipX2 - hipX1)

let hipY2 = rightHip.y * videoHeight
let kneeY = rightKnee.y * videoHeight

let pantsWidth = hipWidth * 2.2
let pantsHeight = kneeY - hipY2 + 80

pantsWidth *= pantsScale
pantsHeight *= pantsScale

pants.style.width = pantsWidth + "px"
pants.style.height = pantsHeight + "px"

pants.style.left = (hipCenter - pantsWidth/2 + pantsOffsetX) + "px"
pants.style.top = (hipY2 - 20 + pantsOffsetY) + "px"

})


// camera

const camera = new Camera(video,{
onFrame:async()=>{
await pose.send({image:video})
},
width:640,
height:480
})

camera.start()

// ===== DRAG =====

function startDrag(e,item){

if(item.style.display==="none") return

draggingItem=item
startX=e.clientX
startY=e.clientY

}

shirt.addEventListener("mousedown",e=>startDrag(e,shirt))
pants.addEventListener("mousedown",e=>startDrag(e,pants))

document.addEventListener("mousemove",e=>{

if(!draggingItem) return

let dx = e.clientX - startX
let dy = e.clientY - startY

if(draggingItem===shirt){
shirtOffsetX += dx
shirtOffsetY += dy
}

if(draggingItem===pants){
pantsOffsetX += dx
pantsOffsetY += dy
}

startX=e.clientX
startY=e.clientY

})

document.addEventListener("mouseup",()=>{
draggingItem=null
})

// ===== ZOOM =====

shirt.addEventListener("wheel",e=>{

e.preventDefault()

if(e.deltaY<0){
shirtScale+=0.05
}else{
shirtScale-=0.05
}

if(shirtScale<0.5) shirtScale=0.5
if(shirtScale>2) shirtScale=2

})

pants.addEventListener("wheel",e=>{

e.preventDefault()

if(e.deltaY<0){
pantsScale+=0.05
}else{
pantsScale-=0.05
}

if(pantsScale<0.5) pantsScale=0.5
if(pantsScale>2) pantsScale=2

})

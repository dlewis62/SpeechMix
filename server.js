var express = require('express')
var fs = require('fs')
var path = require('path')
var execSync = require('child_process').execSync;
var app = express()
var exec = require('child_process').exec;

var wordb =  JSON.parse(fs.readFileSync("static/wordcnt.json")) 
var fproc = {}
clipsdir = "data/Clips/"
staticdir = "static/"


var staticPath = path.join(__dirname, '/static');
app.use(express.static(staticPath));

app.get('/download',function(req,res){
  
  var ID = req.query.ID
  res.send(JSON.stringify(fproc[ID]))

})

app.get('/request', function (req, res) {

  console.log("Request Received")
  var concatT = "concat:"  
  var numAppear;
  var filen;
  var startTime;
  var stopTime;
  var iter = 0;
  var filesClipped = 0;  
  
  res.send('Processing')
  var Phrase = req.query.phrase.split(" ")
  var ID = req.query.id
  var numWord = Phrase.length
  var converts = 0
  console.log(req.query.phrase)
  fproc[ID] = {stat:"converting",comp:0}
  Phrase.forEach(function(element){ 
    element = element.replace(" ","")
    if(typeof wordb[element] == 'undefined'){
    
      console.log("word unavailible")
      numWord = numWord - 1;

    }
    else{
 
      numAppear = wordb[element].loc.length -1
      numAppear = Math.round(Math.random() * (numAppear));
      name = wordb[element].loc[numAppear]
      ts = wordb[element].start[numAppear] 
      te = wordb[element].end[numAppear] 
      //execSync('ffmpeg -i '+ "data/SourceVids/Trump/"+ name +'.mp4 -ss '+ ts +' -to '+ te +' -vcodec mjpeg '+clipsdir+iter+'.avi -y')
      concatT = concatT +clipsdir+ID+iter+".avi|"        
      exec('ffmpeg -i ' + "data/SourceVids/Trump/" + name + '.mp4 -ss ' + ts + ' -to ' + te +' -vcodec mjpeg '+clipsdir+ID+iter+'.avi -y',function(err, out, code){
        numWord = numWord - 1
        console.log(numWord) 
        fproc[ID].comp = (Phrase.length - numWord)/Phrase.length*100
        if(0 == numWord){
          exec("ffmpeg -i \"" + concatT.slice(0,-1) + "\" -af loudnorm=I=-16:TP=-1.5:LRA=11 " +staticdir+ ID + ".webm -y",function(err2,out2,code2){

            console.log(err2)
            fproc[ID].stat = "complete"

          })
        }
      })
      iter = iter + 1
    }


  });

})

app.listen(80, function () {
  console.log('Listening')
})

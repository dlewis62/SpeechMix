//ffmpeg -i President\ Obama\ Bans\ Drilling\ in\ Arctic\ and\ Atlantic.mp4 -ss 00:00:10 -to 00:00:15 newfile.mp4 

var execSync = require('child_process').execSync;
var prompt = require('prompt-sync')();
var fs = require('fs');

var wordb =  JSON.parse(fs.readFileSync("wordcnt.json")) 

var numAppear;
var filen;
var startTime;
var stopTime;
var iter = 0;

trumpdir = "data/SourceVids/Trump/"
clipsdir = "data/Clips/"
concatT = ""

var Phrase = prompt('Phrase? ');

Phrase = Phrase.split(" ")

Phrase.forEach(function(element){ 

  if(typeof wordb[element] == 'undefined'){
    
    console.log("word unavailible")

  }
  else{

    numAppear = wordb[element].loc.length -1
    numAppear = Math.round(Math.random() * (numAppear));
    name = wordb[element].loc[numAppear]
    ts = wordb[element].start[numAppear] 
    te = wordb[element].end[numAppear] 
    execSync('ffmpeg -i '+ "data/SourceVids/Trump/"+ name +'.mp4 -ss '+ ts +' -to '+ te +' -vcodec mjpeg '+clipsdir+iter+'.avi -y')
    concatT = concatT + "file "+"'"+clipsdir+iter+".avi"+ "'"+"\n"
    iter = iter + 1;

  }


});

fs.writeFileSync("concat.txt",concatT)

execSync('ffmpeg -f concat -i concat.txt -c copy output.avi -y')



//   if(typeof wordb[element] == 'undefined'){
  	
//   	console.log("word unavailible")

//   }
//   else{
//   	iter = iter + 1;

//     numAppear = wordb[element].locs.length -1
//     numAppear = Math.round(Math.random() * (numAppear));
//     //console.log(numAppear)
//     //console.log(wordb[element].locs[numAppear])
//     //console.log(wordb[element].filelocs[numAppear])
//     filen = wordb[element].filelocs[numAppear]
//     startTime = wordb[element].locs[numAppear][0]/1000.0-0.3
//     stopTime = wordb[element].locs[numAppear][1]/1000.0+0.3
//     console.log(startTime)
//     console.log(stopTime)
//     console.log(filen)

//     execSync('ffmpeg -i '+ trumpdir + filen +'.mp4 -ss '+ startTime +' -to '+ stopTime +' '+clipsdir+iter+'.mp4 -y')
    
    
  
//   }

// });

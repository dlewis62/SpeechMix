//ffmpeg -i President\ Obama\ Bans\ Drilling\ in\ Arctic\ and\ Atlantic.mp4 -ss 00:00:10 -to 00:00:15 newfile.mp4 
//sox The\ Office\ The\ Lizard\ King.mp3 -r 16000 -b 16 -s -c 1 out.raw
//ffmpeg -i newfile.aac -f s16le -acodec pcm_s16le -ac 1 -osr 16k newfile.raw
//ffmpeg -i Obama.mp4 -f s16le -acodec pcm_s16le -ac 1 -osr 16k -vn newfile.raw


var fs = require('fs');
var ps = require('pocketsphinx').ps;
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var request = require('request');
var formdata = require('form-data');
 
modeldir = "/usr/local/share/pocketsphinx/model/en-us/"
miscdir = "data/SourceVids/Misc/"
trumpdir = "data/SourceVids/Trump/"
rawdir = "data/RawAudio/"
mp3dir = "data/Mp3Audio/"

var config = new ps.Decoder.defaultConfig();
config.setString("-hmm", modeldir + "en-us");
config.setString("-dict", modeldir + "cmudict-en-us.dict");
config.setString("-lm", modeldir + "en-us.lm.bin");
var decoder = new ps.Decoder(config);

 
function getFiles(dir) {

  var results = [];

  fs.readdirSync(dir).forEach(function(file) {

    file = dir+'/'+file;
    var stat = fs.statSync(file);

    if (stat && stat.isDirectory()) {
      results = results.concat(_getAllFilesFromFolder(file))
    } 
    else results.push(file.split("/")[file.split("/").length -1].split(".")[0]);

    });

  return results;

};


function addFile(inputdir,rawdir,mp3dir,outputdir,endArr,SourceIt,prevelement,callback) {

  


  var parsedword = ''
  var parsedpara = ''
  
  exec('ffmpeg -y -i '+inputdir+'.mp4 -f s16le -acodec pcm_s16le -ac 1 -osr 16k -vn '+rawdir+'.raw',function(err, out, code) {

    console.log(err)
    console.log(out)
    console.log(code)

    fs.readFile("./"+rawdir+".raw",function(err,data) {

      decoder.startUtt();
      decoder.processRaw(data, false, false);
      decoder.endUtt();
      console.log(decoder.hyp())

      it = decoder.seg().iter()

      while ((seg = it.next()) != null) {

        parsedword = seg.word.replace("<","").replace(">","").replace("'","").replace("\\","").split("(")[0]
        parsedpara = parsedpara +" "+ parsedword

      }

      exec('ffmpeg -y -i '+inputdir+'.mp4 -f mp3 -vn '+mp3dir+'.mp3',function(err, out, code) {

        console.log(err)
        console.log(out)
        console.log(code)


        var r = request.post("http://localhost:8765/transcriptions?async=false", function(err,httpResponse,body){
 
          //Process Response
          //console.log(err,response)
          //console.log(body);
          
          callback(body,SourceIt,endArr,prevelement)
          

        });

        var form = r.form();

        form.append('audio', fs.createReadStream("./"+mp3dir+".mp3"))
        form.append('transcript' , parsedpara)



      });

 
    }); 

  });



}

function formatOutfile(endArr){

  fmatout = {}
  fs.writeFileSync("temp.json",JSON.stringify(endArr,null,2))

  endArr.files.forEach(function(filenms){

    endArr[filenms].words.forEach(function(alignedW){

      if(typeof alignedW.alignedWord != 'undefined'){
        
        if(typeof fmatout[alignedW.alignedWord] == 'undefined'){

          fmatout[alignedW.alignedWord] = {}
          fmatout[alignedW.alignedWord].start = [alignedW.start]
          fmatout[alignedW.alignedWord].end = [alignedW.end]
          fmatout[alignedW.alignedWord].loc = [filenms]

        }
        else{

          fmatout[alignedW.alignedWord].start.push(alignedW.start)
          fmatout[alignedW.alignedWord].end.push(alignedW.end)
          fmatout[alignedW.alignedWord].loc.push(filenms)

        }
        
        
      }
    
    });

  });

  fs.writeFileSync("wordcnt.json",JSON.stringify(fmatout,null,2))

}


function addFileCallback(body,SourceIt,endArr,prevelement) {

  endArr[prevelement.value[1]]=JSON.parse(body);

  if(!(element = SourceIt.next()).done) {

    addFile("data/SourceVids/Trump/"+element.value[1],"data/RawAudio/"+element.value[1],"data/Mp3Audio/"+element.value[1],"",endArr,SourceIt,element,addFileCallback)

  }
  else{

    formatOutfile(endArr)

  }

}


var SourceFiles = getFiles("./" + "data/SourceVids/Trump/")
console.log(SourceFiles);
endArr = {}
endArr.files = SourceFiles;
SourceIt = SourceFiles.entries()


if(!(element = SourceIt.next()).done) {

  console.log(element.value[1])

  addFile("data/SourceVids/Trump/"+element.value[1],"data/RawAudio/"+element.value[1],"data/Mp3Audio/"+element.value[1],"",endArr,SourceIt,element,addFileCallback)

}





// var wordb = {};
// var parsedword;
// var parsedpara ="";

// for(i = 0; i< SourceFiles.length;i++){
//   console.log(SourceFiles[i])
//   execSync('ffmpeg -y -i '+trumpdir+SourceFiles[i]+'.mp4 -f s16le -acodec pcm_s16le -ac 1 -osr 16k -vn '+rawdir+SourceFiles[i]+'.raw')
//   execSync('ffmpeg -y -i '+trumpdir+SourceFiles[i]+'.mp4 -f mp3 -vn '+mp3dir+SourceFiles[i]+'.mp3')
//   var data =  fs.readFileSync("./"+rawdir+SourceFiles[i]+".raw") 
//   decoder.startUtt();
//   decoder.processRaw(data, false, false);
//   decoder.endUtt();
//   console.log(decoder.hyp())
//   it = decoder.seg().iter()

//   while ((seg = it.next()) != null) {

//     parsedword = seg.word.replace("<","").replace(">","").replace("'","").replace("\\","").split("(")[0]
//     parsedpara = parsedpara +" "+ parsedword


//     // if(typeof wordb[parsedword] == 'undefined'){

//     //   wordb[parsedword] = {
//     //     locs : [[seg.startFrame, seg.endFrame]],
//     //   	filelocs : [SourceFiles[i]]
//     //   }

//     // }
//     // else{

//     //   wordb[parsedword].locs.push([seg.startFrame, seg.endFrame]);
//     //   wordb[parsedword].filelocs.push(SourceFiles[i]);

//     // }
//   }



// }

// //wordb.filesUsed = SourceFiles 
// //fs.writeFileSync("wordb.json",JSON.stringify(wordb,null,2))
// //console.log(wordb)






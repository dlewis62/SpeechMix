//ffmpeg -i President\ Obama\ Bans\ Drilling\ in\ Arctic\ and\ Atlantic.mp4 -ss 00:00:10 -to 00:00:15 newfile.mp4 
//sox The\ Office\ The\ Lizard\ King.mp3 -r 16000 -b 16 -s -c 1 out.raw
//ffmpeg -i newfile.aac -f s16le -acodec pcm_s16le -ac 1 -osr 16k newfile.raw
//ffmpeg -i Obama.mp4 -f s16le -acodec pcm_s16le -ac 1 -osr 16k -vn newfile.raw


var fs = require('fs');
var ps = require('pocketsphinx').ps;
var execSync = require('child_process').execSync;
 
modeldir = "/usr/local/share/pocketsphinx/model/en-us/"
miscdir = "data/SourceVids/Misc/"
rawdir = "data/RawAudio/"

var config = new ps.Decoder.defaultConfig();
config.setString("-hmm", modeldir + "en-us");
config.setString("-dict", modeldir + "cmudict-en-us.dict");
config.setString("-lm", modeldir + "en-us.lm.bin");
var decoder = new ps.Decoder(config);
 
var _getAllFilesFromFolder = function(dir) {

    var results = [];

    fs.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file.split("/")[file.split("/").length -1].split(".")[0]);

    });

    return results;

};


var SourceFiles = _getAllFilesFromFolder("./" + miscdir)
console.log(SourceFiles);
var wordb = {};
var parsedword;

for(i = 0; i< SourceFiles.length;i++){
  console.log(SourceFiles[i])
  execSync('ffmpeg -y -i '+miscdir+SourceFiles[i]+'.mp4 -f s16le -acodec pcm_s16le -ac 1 -osr 16k -vn '+rawdir+SourceFiles[i]+'.raw')
  var data =  fs.readFileSync("./"+rawdir+SourceFiles[i]+".raw") 
  decoder.startUtt();
  decoder.processRaw(data, false, false);
  decoder.endUtt();
  console.log(decoder.hyp())
  it = decoder.seg().iter()

  while ((seg = it.next()) != null) {

    parsedword = seg.word.replace("<","").replace(">","").replace("'","").replace("\\","").split("(")[0]

    if(typeof wordb[parsedword] == 'undefined'){

      wordb[parsedword] = {
        locs : [[seg.startFrame, seg.endFrame]],
      	filelocs : [SourceFiles[i]]
      }

    }
    else{

      wordb[parsedword].locs.push([seg.startFrame, seg.endFrame]);
      wordb[parsedword].filelocs.push(SourceFiles[i]);

    }
  }

}

wordb.filesUsed = SourceFiles 
fs.writeFileSync("wordb.json",JSON.stringify(wordb,null,2))
console.log(wordb)






/* APK 전용: 안드로이드 WebView에는 음성(speechSynthesis)이 없어서, 앱(MainActivity)의 TTS 엔진으로 대신 말해요.
   빌드할 때 index.html <head> 맨 앞에 넣어요. 웹(깃허브 페이지)에는 들어가지 않아요. */
(function(){
  if(!window.AndroidTTS) return;
  var seq=0, live={}, current=null;
  function Utt(text){ this.text=text==null?'':String(text); this.lang='ko-KR'; this.rate=1; this.pitch=1; this.volume=1; this.voice=null;
    this.onstart=null; this.onend=null; this.onerror=null; }
  function fire(u, type, extra){ var ev={type:type, utterance:u}; for(var k in extra||{}) ev[k]=extra[k];
    try{ if(typeof u['on'+type]==='function') u['on'+type](ev); }catch(e){} }
  var synth={
    pending:false, paused:false, onvoiceschanged:null,
    get speaking(){ try{ return current!==null || AndroidTTS.speaking(); }catch(e){ return false; } },
    speak:function(u){
      var id='u'+(++seq); live[id]=u; current=id;
      var ok=false; try{ ok=AndroidTTS.speak(id, u.text, +u.rate||1, u.volume==null?1:+u.volume); }catch(e){}
      if(!ok){ delete live[id]; if(current===id) current=null; setTimeout(function(){ fire(u,'error',{error:'synthesis-failed'}); },0); }
    },
    cancel:function(){ try{ AndroidTTS.cancel(); }catch(e){} },
    pause:function(){}, resume:function(){},
    getVoices:function(){ return []; },
    addEventListener:function(){}, removeEventListener:function(){}
  };
  window.__androidTTS=function(type, id){
    var u=live[id]; if(!u) return;
    if(type==='start'){ fire(u,'start'); return; }
    delete live[id]; if(current===id) current=null;
    fire(u, type==='error'?'error':'end', type==='error'?{error:'synthesis-failed'}:{});
  };
  try{ Object.defineProperty(window,'speechSynthesis',{value:synth, configurable:true, writable:true}); }catch(e){ window.speechSynthesis=synth; }
  try{ Object.defineProperty(window,'SpeechSynthesisUtterance',{value:Utt, configurable:true, writable:true}); }catch(e){ window.SpeechSynthesisUtterance=Utt; }
})();

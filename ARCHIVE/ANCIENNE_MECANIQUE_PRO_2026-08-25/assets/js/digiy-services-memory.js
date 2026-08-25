(function(){
  "use strict";
  var V="services-memory-official-20260606";
  var P="DIGIY_SERVICES";
  var K={session:P+"_SESSION",notes:P+"_NOTES",drafts:P+"_DRAFTS",requests:P+"_REQUESTS",quotes:P+"_QUOTES",latest:P+"_LATEST_DRAFT"};
  function now(){return new Date().toISOString();}
  function id(k){return String(k||"services")+"_"+Date.now()+"_"+Math.random().toString(16).slice(2,8);}
  function read(k,f){try{var r=localStorage.getItem(k);return r?JSON.parse(r):f;}catch(_){return f;}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(_){return false;}}
  function list(k){var a=read(k,[]);return Array.isArray(a)?a:[];}
  function txt(v){return String(v||"").trim();}
  function amount(v){var m=String(v||"").replace(/\s+/g," ").match(/(\d[\d\s.,]*)\s*(?:f|fcfa|xof)?/i);if(!m)return null;var n=Number(String(m[1]).replace(/[^\d]/g,""));return Number.isFinite(n)&&n>0?n:null;}
  function norm(o,kind){
    var s=o&&typeof o==="object"?o:{text:txt(o)};
    var t=txt(s.text||s.note||s.raw_text||s.clean_text||(s.draft&&s.draft.problem)||"");
    var a=s.amount||(s.draft&&s.draft.quote_amount)||amount(t);
    var c=s.created_at||s.createdAt||now();
    return Object.assign({},s,{id:s.id||id(kind),module:s.module||"BUILD",source:s.source||"DIGIY_SERVICES_MEMORY",kind:s.kind||kind||"Note",status:s.status||"brouillon",validation_required:s.validation_required!==false,requiresHumanValidation:s.requiresHumanValidation!==false,text:t,note:s.note||t,amount:a||null,currency:s.currency||(a?"XOF":""),created_at:c,createdAt:s.createdAt||c,updated_at:now(),safety:Object.assign({noAutoQuote:true,noAutoPromise:true,noAutoPayment:true,humanValidationRequired:true},s.safety||{})});
  }
  function up(k,o,kind){var r=norm(o,kind),rows=list(k),done=false;rows=rows.map(function(x){if(r.id&&String(x&&x.id)===String(r.id)){done=true;return Object.assign({},x,r,{updated_at:now()});}return x;});if(!done)rows.unshift(r);write(k,rows.slice(0,180));return r;}
  function addNote(t,meta){var p=meta&&meta.packet?meta.packet:{};var r=norm(Object.assign({},p,{text:txt(t),note:txt(t),source:(meta&&meta.source)||"note-service"}),"Note");var rows=list(K.notes);rows.unshift(r);write(K.notes,rows.slice(0,180));return r;}
  function saveDraft(p){var r=norm(p||{},"Brouillon");var rows=list(K.drafts);rows.unshift(r);write(K.drafts,rows.slice(0,120));write(K.latest,r);return r;}
  function rememberSession(s){var r=Object.assign({},s||{},{module:"BUILD",source:"DIGIY_SERVICES_MEMORY",updated_at:now()});write(K.session,r);return r;}
  window.DIGIY_SERVICES_MEMORY={version:V,keys:Object.assign({},K),rememberSession:rememberSession,session:function(){return read(K.session,{});},addNote:addNote,notes:function(){return list(K.notes);},saveDraft:saveDraft,drafts:function(){return list(K.drafts);},upsertRequest:function(p){return up(K.requests,p,"Demande");},requests:function(){return list(K.requests);},upsertQuote:function(p){return up(K.quotes,p,"Devis");},quotes:function(){return list(K.quotes);},latestDraft:function(){return read(K.latest,null);},clearKind:function(k){var m={notes:K.notes,drafts:K.drafts,requests:K.requests,quotes:K.quotes};if(!m[k])return false;write(m[k],[]);return true;}};
  try{window.dispatchEvent(new CustomEvent("digiy:services-memory-ready",{detail:{version:V}}));}catch(_){ }
})();

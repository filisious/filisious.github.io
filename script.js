'use strict';
(() => {
 const C=window.CARD, $=id=>document.getElementById(id);
 const paths={contact:'M8 3H5v18h14V3h-3M9 3h6v4H9z M9 17c0-4 6-4 6 0 M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4',phone:'M7 3 4 4c-3 7 9 19 16 16l1-3-5-3-2 2c-3-1-5-3-6-6l2-2z',mail:'M3 5h18v14H3z M3 6l9 7 9-7',copy:'M8 8h12v13H8z M16 8V3H3v13h5',share:'M12 16V3m-4 4 4-4 4 4 M5 13v8h14v-8',qr:'M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h3v3h3v3h-6z M21 12h-3 M12 12v3 M12 21v-3',close:'m6 6 12 12 M18 6 6 18',telegram:'m3 10 18-7-4 18-6-5-4 3v-6l10-7-8 9z',whatsapp:'M20.5 11.5a9 9 0 0 1-13.4 7.9L3 21l1.5-4.2a9 9 0 1 1 16-5.3 M8 7c-2 4 3 9 7 8l1-2-3-1-1 1-2-2 1-1-2-3z'};
 document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[el.dataset.icon]+'"/></svg>';});
 let lang='en',timer,contactURL;
 try{lang=localStorage.getItem('ak-language')||'';}catch{lang='';}
 if(!C.translations[lang]){const browser=(navigator.language||'en').toLowerCase().split('-')[0];lang=browser==='ru'?'ru':['fa','fas','per'].includes(browser)?'fa':'en';}
 const t=()=>C.translations[lang];
 function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('toast').classList.remove('visible'),3400);}
 function applyLanguage(){document.documentElement.lang=lang;document.documentElement.dir=lang==='fa'?'rtl':'ltr';$('name').textContent=$('qr-name').textContent=t().name;$('description').textContent=t().description;document.querySelectorAll('[data-text]').forEach(el=>el.textContent=t()[el.dataset.text]);document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===lang)));$('languages').setAttribute('aria-label',t().language);$('copy-phone').setAttribute('aria-label',t().copyPhone);$('copy-email').setAttribute('aria-label',t().copyEmail);$('manual-copy').setAttribute('aria-label',t().manual);$('qr-code').setAttribute('aria-label',t().scan);}
 document.querySelectorAll('[data-lang]').forEach(el=>el.addEventListener('click',()=>{lang=el.dataset.lang;try{localStorage.setItem('ak-language',lang);}catch{}applyLanguage();}));
 const wa='https://wa.me/'+C.phone.replace(/\D/g,''),tg='https://t.me/'+C.telegram.replace(/^@/,'');
 $('whatsapp').href=wa;$('telegram').href=tg;
 $('call').href=$('phone-detail').href='tel:'+C.phone;$('mail').href=$('email-detail').href='mailto:'+C.email;
 $('phone-detail').textContent=C.phoneDisplay;$('email-detail').textContent=C.email;
 const escapeVC=value=>String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
 function fold(line){let out='',count=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(count+n>75){out+='\r\n ';count=1;}out+=c;count+=n;}return out;}
 const fullName=C.firstName+' '+C.lastName;
 const vcard=['BEGIN:VCARD','VERSION:3.0','N:'+escapeVC(C.lastName)+';'+escapeVC(C.firstName)+';;;','FN:'+escapeVC(fullName),'TEL;TYPE=CELL:'+C.phone,'EMAIL;TYPE=INTERNET:'+escapeVC(C.email),'URL:'+tg,'URL:'+wa,'NOTE:'+escapeVC(C.translations.en.description+'\nTelegram: '+tg+'\nWhatsApp: '+wa),'END:VCARD'].map(fold).join('\r\n')+'\r\n';
 contactURL=URL.createObjectURL(new Blob([vcard],{type:'text/vcard;charset=utf-8'}));$('save').href=contactURL;$('save').addEventListener('click',()=>notify(t().saved));
 function publicURL(){const u=new URL(C.SITE_URL||location.href);if(!/^https?:$/.test(u.protocol)||/^(localhost|127\..*|0\.0\.0\.0|\[::1\])$/.test(u.hostname))throw Error('local');u.hash='';u.search='';u.pathname=u.pathname.replace(/index\.html$/,'');return u.href;}
 async function copy(value,success){try{if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText(value);notify(success);return;}catch{}
 const area=document.createElement('textarea');area.value=value;area.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.append(area);area.select();let ok=false;try{ok=document.execCommand('copy');}catch{}area.remove();if(ok){notify(success);return;}
 $('manual-copy').value=value;$('copy-dialog').showModal();document.body.classList.add('modal-open');$('manual-copy').focus();$('manual-copy').select();}
 $('copy-phone').addEventListener('click',()=>copy(C.phone,t().copied));$('copy-email').addEventListener('click',()=>copy(C.email,t().copied));
 $('copy-dialog').addEventListener('close',()=>document.body.classList.remove('modal-open'));
 $('share').addEventListener('click',async()=>{let url;try{url=publicURL();}catch{notify(t().local);return;}if(navigator.share){try{await navigator.share({title:fullName,url});notify(t().shared);return;}catch(e){if(e.name==='AbortError')return;}}await copy(url,t().linkCopied);});
 function drawQR(url){const qr=qrcode(0,'M');qr.addData(url,'Byte');qr.make();const count=qr.getModuleCount(),size=count+8;let path='';for(let r=0;r<count;r++)for(let c=0;c<count;c++)if(qr.isDark(r,c))path+=`M${c+4},${r+4}h1v1h-1z`;
 $('qr-code').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;}
 $('show-qr').addEventListener('click',()=>{$('qr-error').hidden=true;$('qr-code').hidden=false;$('qr-url').textContent='';$('qr-url').removeAttribute('href');let url;try{url=publicURL();$('qr-url').href=url;$('qr-url').textContent=url.replace(/^https?:\/\//,'');drawQR(url);}catch(e){$('qr-code').hidden=true;$('qr-error').hidden=false;$('qr-error').textContent=url?t().qrError:t().local;}$('qr-dialog').showModal();document.body.classList.add('modal-open');$('close-qr').focus();});
 $('close-qr').addEventListener('click',()=>$('qr-dialog').close());$('qr-dialog').addEventListener('close',()=>{document.body.classList.remove('modal-open');$('show-qr').focus();});
 document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const items=[...dialog.querySelectorAll('button,a[href],input')].filter(el=>!el.disabled&&el.getClientRects().length);
  if(!items.length)return;
  const first=items[0],last=items[items.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }));
 applyLanguage();
 if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(()=>{});});}
})();

/* Reference-inspired details, scoped to the Home and About additions. */
(function(){
  'use strict';
  const gallery=document.querySelector('[data-frame-gallery]');
  if(gallery){
    const deck=gallery.querySelector('.frame-deck'),cards=Array.from(deck.querySelectorAll('.frame-card'));let active=0;
    function show(index){active=(index+cards.length)%cards.length;cards.forEach((card,i)=>{let distance=i-active;if(distance>cards.length/2)distance-=cards.length;if(distance<-cards.length/2)distance+=cards.length;card.style.setProperty('--offset',distance);card.style.setProperty('--scale',1-Math.abs(distance)*.09);card.style.setProperty('--layer',cards.length-Math.abs(distance));card.style.setProperty('--brightness',1-Math.abs(distance)*.12);card.setAttribute('aria-pressed',String(i===active));});gallery.querySelector('[data-frame-status]').textContent=cards[active].dataset.caption+' \u00b7 '+(active+1)+' / '+cards.length;}
    cards.forEach((card,i)=>card.addEventListener('click',()=>show(i)));
    gallery.addEventListener('keydown',event=>{let index;if(event.key==='ArrowRight')index=active+1;if(event.key==='ArrowLeft')index=active-1;if(event.key==='Home')index=0;if(event.key==='End')index=cards.length-1;if(index!==undefined){event.preventDefault();show(index);}});
    // Horizontal two-finger trackpad gestures rotate the stack without clicking.
    // Leave vertical page scrolling and pinch-to-zoom with the browser.
    let wheelTotal=0,lastWheel=0,lastStep=0;
    gallery.addEventListener('wheel',event=>{
      if(event.ctrlKey)return;
      const dx=event.deltaX||0,dy=event.deltaY||0;
      if(!event.shiftKey&&Math.abs(dx)<=Math.abs(dy))return;
      const delta=(event.shiftKey&&Math.abs(dy)>Math.abs(dx)?dy:dx)*(event.deltaMode===1?16:event.deltaMode===2?300:1);
      if(!delta)return;
      event.preventDefault();const now=Date.now();
      if(now-lastWheel>180||Math.sign(delta)!==Math.sign(wheelTotal))wheelTotal=0;
      lastWheel=now;wheelTotal+=delta;
      if(Math.abs(wheelTotal)>=45&&now-lastStep>=220){show(active+(wheelTotal>0?1:-1));wheelTotal=0;lastStep=now;}
    },{passive:false});
    let drag,suppressClick=false;
    deck.addEventListener('pointerdown',event=>{if(event.button!==0)return;suppressClick=false;drag={id:event.pointerId,x:event.clientX,y:event.clientY};});
    deck.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)){suppressClick=true;deck.setPointerCapture(event.pointerId);deck.classList.add('is-dragging');}});
    deck.addEventListener('pointerup',event=>{if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)){suppressClick=true;show(active+(dx<0?1:-1));}drag=null;deck.classList.remove('is-dragging');});
    for(const event of ['pointercancel','lostpointercapture'])deck.addEventListener(event,()=>{drag=null;deck.classList.remove('is-dragging');});
    deck.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false;}},true);
    deck.querySelectorAll('img').forEach(img=>img.draggable=false);show(0);
  }
  const scene=document.querySelector('[data-wall-scene]');
  if(scene&&'IntersectionObserver' in window){new IntersectionObserver(entries=>entries.forEach(entry=>scene.classList.toggle('is-offscreen',!entry.isIntersecting)),{threshold:.1}).observe(scene);}
  document.querySelectorAll('[data-play-object]').forEach(object=>{let x=0,y=0,drag;const clamp=value=>Math.max(-100,Math.min(100,value));function move(nx,ny){x=clamp(nx);y=clamp(ny);object.style.setProperty('--drag-x',x+'px');object.style.setProperty('--drag-y',y+'px');}object.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,ox:x,oy:y};object.setPointerCapture(event.pointerId);});object.addEventListener('pointermove',event=>{if(drag&&event.pointerId===drag.id)move(drag.ox+event.clientX-drag.x,drag.oy+event.clientY-drag.y);});function end(){drag=null;}object.addEventListener('pointerup',end);object.addEventListener('pointercancel',end);object.addEventListener('lostpointercapture',end);object.addEventListener('keydown',event=>{const delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[event.key];if(delta){event.preventDefault();move(x+delta[0],y+delta[1]);}if(event.key==='Home'||event.key==='Escape'){event.preventDefault();move(0,0);}});});
})();

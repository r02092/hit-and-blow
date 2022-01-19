var playerName=["あなた","コンピュータ"];
var memoBtn=document.getElementById("memoBtn");
var memoBtnData=new Array(10).fill(0);
for(var i=0;i<2;i++){
	var tr=document.createElement("tr");
	for(var j=0;j<5;j++){
		var td=document.createElement("td");
		td.addEventListener("click",(e)=>{
			if(memoBtnData[e.target.textContent]<2){
				memoBtnData[e.target.textContent]++;
			}else{
				memoBtnData[e.target.textContent]=0;
			}
			e.target.style.background=["white","red","green"][memoBtnData[e.target.textContent]];
			e.target.style.color=["black","white","white"][memoBtnData[e.target.textContent]];
		});
		td.textContent=5*i+j;
		tr.appendChild(td);
	}
	memoBtn.appendChild(tr);
}
var log=document.getElementsByClassName("log");
for(var i=0;i<2;i++){
	var table=document.createElement("table");
	var thead=document.createElement("thead");
	var tr=document.createElement("tr");
	var th=document.createElement("th");
	th.textContent=playerName[i] + "の攻撃";
	tr.appendChild(th);
	thead.appendChild(tr);
	table.appendChild(thead);
	var tbody=document.createElement("tbody");
	for(var j=0;j<5;j++)appendLine(tbody);
	table.appendChild(tbody);
	log[i].appendChild(table);
}
var com=true;
var len=3;
var duplicate=1;
var num=["",""];
var logLine=[1,1];
var turn=1;
var firstPlayer=1;
var hit=0;
var blow=0;
document.getElementById("len").textContent=len;
if(com)var targetNums=genOpt(10,len,duplicate);
if(duplicate){
	num[0]="646";//(Array(len).join("0")+Math.floor(Math.random()*Math.pow(10,len))).slice(-len);
}else{
	document.getElementById("duplicate").textContent="重複無し";
	var digits=genDigits(10);
	for(var i=0;i<len;i++){
		num[0]+=digits.splice(Math.floor(Math.random()*digits.length),1);
	}
}
//646
//663
//
//do num[1]=prompt("自分の答えの数字:");while(!isUsableNum(num[1]));

ansElem=document.getElementById("ans");
var interval;
$("#start").click(function(ev){
	var currentMyNum = $("#myNum").val();
	if(isUsableNum(currentMyNum)){
		var sTime=Date.now();
		interval=setInterval(()=>document.getElementById("time").textContent=new Date(Date.now()-sTime).toISOString().slice(11,19),1000);
		num[1] = currentMyNum;
		$(".title").fadeOut(500);
	}else{
		if(currentMyNum == ""){
			alert("数字を入れてください")
		}else{
			alert("その数字は利用できません");
		}
		$("#myNum").focus();
		$("#myNum").select();
	}
});
ansElem.addEventListener("input",()=>{
	if(isUsableNum(ansElem.value)){
		ansProcess(ansElem.value,0);
		if(com){
			comAns=[6,6,6];//targetNums.splice(Math.floor(Math.random()*targetNums.length),1)[0];
			ansProcess(comAns.join(""),1);
			var newNums=[];
			for(i of targetNums){
				var hits=[];
				for(var j=0;j<len;j++){
					if(comAns[j]==i[j]){
						hits.push(j);
					}
				}
				if(hits.length==hit){
					var comBlow=0;
					var inversionHits=genDigits(len).filter(i=>!hits.includes(i));
					for(j of inversionHits)if(comAns.filter((_e,i)=>(inversionHits.includes(i))).includes(i[j]))comBlow++;
					if(blow==comBlow)newNums.push(i);
				}
			}
			targetNums=newNums;
		}
		ansElem.value="";
	}
});
var infoElem=document.getElementById("info");
var memo=document.getElementById("memo");
var memoClearBtn=document.getElementById("memoClearBtn");
var memoContext=memo.getContext("2d");
var memoFlg=true;
var memoLast={x:null,y:null};
memoResize();
window.addEventListener("resize",memoResize);
memoClearBtn.addEventListener("click",()=>memoContext.clearRect(0,0,memo.width,memo.height));
memo.addEventListener("mousedown",memoDragStart);
memo.addEventListener("mouseup",memoDragEnd);
memo.addEventListener("mouseout",memoDragEnd);
memo.addEventListener("mousemove",(e)=>memoDraw(e.layerX,e.layerY));
memo.addEventListener("touchstart",memoDragStart);
memo.addEventListener("touchend",memoDragEnd);
memo.addEventListener("touchcancel",memoDragEnd);
memo.addEventListener("touchmove",(e)=>{
	for(var li of e.touches)memoDraw(li.clientX-memo.getBoundingClientRect().left,li.clientY-memo.getBoundingClientRect().top);
});
function genDigits(llen){ //0から数字を並べた配列を生成する関数
	return Array.apply(null,new Array(llen)).map((a,i)=>{return i});
}
function isUsableNum(num){ //使用可能な数字であるかどうか判別する関数
	return (!/(.).*\1/.test(num)||duplicate)&&new RegExp("^\\d{"+len+"}$").test(num);
}
function appendLine(elem){ //ログの表に行を追加する関数
	var ltr=document.createElement("tr");
	for(var li=0;li<2;li++){
		var ltd=document.createElement("td");
		ltr.appendChild(ltd);
	}
	elem.appendChild(ltr);
}
function txtCount(txt,searchTxt){ //文字列内の特定の文字列の登場回数を取得する関数
	return (txt.match(new RegExp(searchTxt,"g"))||[]).length;
}
function ansProcess(ans,player){ //解答を処理する関数
	ltbody=document.querySelector("div.log:nth-child("+(1+2*player)+") tbody");
	if(logLine[player]>ltbody.childElementCount)appendLine(ltbody);
	ltbody.querySelector("tr:nth-child("+logLine[player]+")>td:nth-child(1)").textContent=ans;
	hit=0;
	blow=0;
	var localnum = Array.from(num);
	var localans = ans;
	for(var li=0;li<localnum[player].length;li++){
		if(localnum[player][li]==ans[li]){
			hit++;
			localnum[player] = removeCharacter(li,localnum[player]);
			localans = removeCharacter(li,localans);
			alert(localnum[player] + "\n" + localans);
		}else if(localnum[player].indexOf(localans[li])>-1){
			blow++;
			
			//num[]隠された答え、ans(入力された答え)
			//var delta=txtCount(num[player],ans[li])-txtCount(ans,ans[li]);
			//alert(txtCount(num[player],ans[li]) + "、" + txtCount(ans,ans[li]))
			//if(delta<0)blow+=delta;
		}
	}
	ltbody.querySelector("tr:nth-child("+logLine[player]+")>td:nth-child(2)").textContent=hit+"h"+blow+"b";
	ltbody.scrollTop=ltbody.scrollHeight;
	if(hit==len&&blow==0){
		endGame();
	}else{
		if(player!=firstPlayer){
			turn++;
			document.getElementById("turn").textContent=turn;
		}
		logLine[player]++;
	}
}
function genOptRecur(perm,pre,post,n,lduplicate){ //↓の関数で使用する再帰関数
	var rest;
	if(n>0){
		for(var li=0;li<post.length;li++){
			rest=post.slice(0);
			genOptRecur(perm,pre.concat((duplicate?post.slice(0):rest).splice(li,1)),rest,n-1,lduplicate);
		}
	}else{
		perm.push(pre);
	}
}
function genOpt(digitsNum,llen,lduplicate){ //解の候補となる番号の配列を返す関数
	var opt=[];
	genOptRecur(opt,[],genDigits(digitsNum),llen,lduplicate);
	return opt;
}
function endGame(){ //ゲーム終了後に実行される関数
	clearInterval(interval);
	document.getElementById("ans").setAttribute("disabled","");
}
function memoResize(){ //メモの大きさを調整する関数
	memo.width=infoElem.clientWidth;
	memo.height=window.innerHeight-infoElem.clientHeight-ansElem.clientHeight-64;
}
function memoDraw(x,y){ //メモの描画を行う関数
	if(memoFlg)return;
	if(memoLast.x===null||memoLast.y===null){
		memoContext.moveTo(x,y);
	}else{
		memoContext.moveTo(memoLast.x,memoLast.y);
	}
	memoContext.lineTo(x,y);
	memoContext.stroke();
	memoLast.x=x;
	memoLast.y=y;
}
function memoDragStart(){ //メモ上でドラッグ開始時に実行される関数
	memoContext.beginPath();
	memoFlg=false;
}
function memoDragEnd(){ //メモ上でドラッグ終了時に実行される関数
	memoContext.closePath();
	memoFlg=true;
	memoLast.x=null;
	memoLast.y=null;
}
function removeCharacter(position,str){
	return str.slice(0, position) + str.slice(position + 1);
}



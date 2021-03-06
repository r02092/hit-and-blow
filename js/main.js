var logo=document.getElementById("logo");
logo.addEventListener("click",logoAnimation);
window.onload=()=>{
	logo.style.visibility="visible";
	logoAnimation();
};
var memoBtn=document.getElementById("memoBtn");
var memoBtnData=new Array(10).fill(0);
document.getElementById("y").textContent = new Date().getFullYear();
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
var duplicate=0;
var num=["",""];
var logLine=[1,1];
var turn=1;
var hit=0;
var blow=0;
var interval;
var waitFlg;
const ansElem=document.getElementById("ans");
const onlinePlayServer="https://hit-and-blow-server.herokuapp.com";
$("#start").click(function(ev){
	if(typeof targetNums==="undefined"){
		var currentMyNum=$("#myNum").val();
		len=currentMyNum.length;
		if(isUsableNum(currentMyNum)&&len>0){
			playerName=["あなた","コンピュータ"];
			com=true;
			targetNums=genOpt(10,len,duplicate);
			if(duplicate){
				num[0]=(Array(len).join("0")+Math.floor(Math.random()*Math.pow(10,len))).slice(-len);
			}else{
				var digits=genDigits(10);
				for(var li=0;li<len;li++)num[0]+=digits.splice(Math.floor(Math.random()*digits.length),1);
			}
			//646
			//663
			//
			//do num[1]=prompt("自分の答えの数字:");while(!isUsableNum(num[1]));
			prepareGame();
			num[1] = currentMyNum;
			playerId=0;
			$(".title").fadeOut(500);
		}else{
			showError(currentMyNum == "");
		}
	}
});
$("#online").click(()=>{
	document.getElementById("title-top-button").style.display="none";
	$("#setsumei").fadeOut(500);
	$("#questionaire").fadeOut(500);
	document.getElementById("title-online").style.display="block";
	document.getElementById("roomId").addEventListener("input",e=>{
		document.getElementById("btnMsg").textContent=e.target.value!=""?"始める":"部屋を作成";
		document.getElementsByTagName("label")[0].style.display=e.target.value!=""?"none":"block";
	});
	document.getElementById("duplicate").addEventListener("change",e=>document.getElementById("noDuplicate").style.display=e.target.checked?"none":"inline");
});
$("#submit").click(()=>{
	var currentMyNum=$("#myNum").val();
	len=currentMyNum.length;
	duplicate=document.getElementById("duplicate").checked;
	if(len<1)showError(true);
	if(!/^([\da-f]{2})?$/.test($("#roomId").val())){
		alert("部屋IDの形式が正しくありません");
		focusSelect("roomId");
		len=0;
	}
	if(!isUsableNum(currentMyNum)&&$("#roomId").val()==""){
		showError(false);
		len=0;
	}
	if(len>0&&typeof com==="undefined"){
		var firstXhr=new XMLHttpRequest();
		firstXhr.open("POST",onlinePlayServer);
		firstXhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		var sendData="&num="+$("#myNum").val()+"&name="+$("#myName").val();
		if($("#roomId").val()!=""){
			firstXhr.onload=()=>{
				if(firstXhr.status==200){
					duplicate=Number(firstXhr.responseText.charAt(0));
					if(isUsableNum(currentMyNum)){
						if(typeof com==="undefined"){
							playerId=0;
							startOnline(firstXhr.responseText.slice(1));
							wait();
						}
					}else{
						showError(false);
					}
				}else if(firstXhr.status==422){
					alert("自分の答えの番号を"+firstXhr.responseText.slice(1)+"桁"+(firstXhr.responseText.charAt(0)-0?"":"重複無し")+"で入力してください");
				}else{
					showError();
				}
			}
			firstXhr.send("act=start&id="+$("#roomId").val()+sendData);
		}else{
			firstXhr.onload=()=>{
				if(firstXhr.status!=200){
					showError();
				}else if(typeof com==="undefined"){
					if(navigator.share){
						navigator.share({
							title:"Hit & Blow オンライン",
							url:"https://r02092.github.io/hit-and-blow/#"+firstXhr.responseText
						});
					}
					document.getElementById("title-top").style.display="none";
					document.getElementById("title-online").style.display="none";
					document.getElementById("title-online-share").style.display="block";
					document.getElementById("roomId").value=firstXhr.responseText;
					document.getElementById("roomIdDisplay").textContent=firstXhr.responseText;
					document.getElementById("roomIdLink").textContent="https://r02092.github.io/hit-and-blow/#"+firstXhr.responseText;
					document.getElementById("roomIdLink").setAttribute("href","https://r02092.github.io/hit-and-blow/#"+firstXhr.responseText);
					var secondXhr=new XMLHttpRequest();
					secondXhr.open("POST",onlinePlayServer);
					secondXhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
					secondXhr.onload=()=>{
						if(secondXhr.status!=200){
							showError();
						}else if(typeof com==="undefined"){
							playerId=1;
							startOnline(secondXhr.responseText);
						}
					}
					secondXhr.send("act=waitStart&id="+firstXhr.responseText);
				}
			}
			firstXhr.send("act=genRoom"+sendData+"&duplicate="+duplicate);
		}
	}
});
if(location.hash!=""){
	document.getElementById("online").dispatchEvent(new Event("click"));
	document.getElementById("roomInput").style.display="none";
	document.getElementById("roomId").value=location.hash.slice(1);
	document.getElementById("btnMsg").textContent="始める";
}
ansElem.addEventListener("input",async ()=>{
	if(!waitFlg&&isUsableNum(ansElem.value)){
		ansProcess(ansElem.value,0);
		ansElem.value="";
		if(com){
			comAns=targetNums.splice(Math.floor(Math.random()*targetNums.length),1)[0];
			ansProcess(comAns.join(""),1);
			var newNums=[];
			for(li of targetNums){
				var hits=[];
				for(var lj=0;lj<len;lj++){
					if(comAns[lj]==li[lj]){
						hits.push(lj);
					}
				}
				if(hits.length==hit){
					var comBlow=0;
					var inversionHits=genDigits(len).filter(li=>!hits.includes(li));
					for(lj of inversionHits)if(comAns.filter((_e,li)=>(inversionHits.includes(li))).includes(li[lj]))comBlow++;
					if(blow==comBlow)newNums.push(li);
				}
			}
			targetNums=newNums;
		}else{
			await wait();
		}
	}
});
var infoElem=document.getElementById("info");
var memo=document.getElementById("memo");
var memoClearBtn=document.getElementById("memoClearBtn");
var memoContext=memo.getContext("2d");
var memoFlg=true;
var memoLast={x:null,y:null};
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
function logoAnimation(){ //タイトルロゴを動かす関数
	logo.src="logo.svg?"+new Date().getTime();
}
function genDigits(llen){ //0から数字を並べた配列を生成する関数
	return Array.apply(null,new Array(llen)).map((a,i)=>{return i});
}
function isUsableNum(num){ //使用可能な数字であるかどうか判別する関数
	return (!/(.).*\1/.test(num)||duplicate)&&new RegExp("^\\d{"+len+"}$").test(num);
}
function prepareGame(){ //ゲームの準備をする関数
	for(var li=0;li<2;li++){
		var table=document.createElement("table");
		var thead=document.createElement("thead");
		var tr=document.createElement("tr");
		var th=document.createElement("th");
		th.textContent=playerName[li]+"の攻撃";
		tr.appendChild(th);
		thead.appendChild(tr);
		table.appendChild(thead);
		var tbody=document.createElement("tbody");
		for(var lj=0;lj<5;lj++)appendLine(tbody);
		table.appendChild(tbody);
		document.getElementsByClassName("log")[li].appendChild(table);
	}
	memoResize();
	var sTime=Date.now();
	interval=setInterval(()=>document.getElementById("time").textContent=new Date(Date.now()-sTime).toISOString().slice(11,19),1000);
}
function focusSelect(id){ //指定したIDの要素をフォーカスして全選択する関数
	$("#"+id).focus();
	$("#"+id).select();
}
function startOnline(opponent){ //オンライン対戦の準備をする関数
	num[1]=$("#myNum").val();
	playerName=[$("#myName").val(),opponent];
	com=false;
	prepareGame();
	$(".title").fadeOut(500);
}
async function wait(){ //オンライン対戦で相手を待つ関数
	var waitXhr=new XMLHttpRequest();
	waitXhr.open("POST",onlinePlayServer);
	waitXhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	waitXhr.onload=()=>window.dispatchEvent(new Event("wait"));
	waitXhr.send("act=wait&id="+$("#roomId").val()+"&player="+playerId);
	waitFlg=true;
	document.getElementById("ans").setAttribute("disabled","");
	await new Promise(r=>window.addEventListener("wait",r));
	document.getElementById("ans").removeAttribute("disabled");
	await ansProcess(waitXhr.responseText,1);
	waitFlg=false;
}
function showError(errId){ //エラーを表示する関数
	switch(errId){
		case false:
			alert("その数字は利用できません");
			break;
		case true:
			alert("数字を入れてください");
			break;
		default:
			alert("オンライン対戦用サーバから予期されていないステータスコードが返りました");
	}
	if(typeof errId==="boolean")focusSelect("myNum");
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
async function ansProcess(ans,player){ //解答を処理する関数
	var ltbody=document.querySelector("div.log:nth-child("+(1+2*player)+") tbody");
	if(logLine[player]>ltbody.childElementCount)appendLine(ltbody);
	ltbody.querySelector("tr:nth-child("+logLine[player]+")>td:nth-child(1)").textContent=ans;
	if(player||com){
		hit=0;
		blow=0;
		var localnum = Array.from(num);
		var localans = ans;
		//hitのときに数字を削除するとliの番号とズレが生じる
		//そのため数字を削除した数の分だけliから引く
		var movedQuantity = 0;
		for(var li=0;li<len;li++){
			if(localnum[player][li-movedQuantity]==localans[li-movedQuantity]){
				hit++;
				localnum[player] = removeCharacter(li-movedQuantity,localnum[player]);
				localans = removeCharacter(li-movedQuantity,localans);
				movedQuantity++;
			}else if(localnum[player].indexOf(localans[li-movedQuantity])>-1){
				blow++;
				//num[]隠された答え、ans(入力された答え)
				//var delta=txtCount(num[player],ans[li])-txtCount(ans,ans[li]);
				//alert(txtCount(num[player],ans[li]) + "、" + txtCount(ans,ans[li]))
				//if(delta<0)blow+=delta;
			}
		}
	}else{
		var judgeXhr=new XMLHttpRequest();
		judgeXhr.open("POST",onlinePlayServer);
		judgeXhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		judgeXhr.onload=()=>window.dispatchEvent(new Event("judge"));
		judgeXhr.send("act=judge&id="+$("#roomId").val()+"&player="+playerId+"&ans="+ans);
		await new Promise(r=>window.addEventListener("judge",r));
		var judge=judgeXhr.responseText.split(" ");
		hit=judge[0];
		blow=judge[1];
	}
	ltbody.querySelector("tr:nth-child("+logLine[player]+")>td:nth-child(2)").textContent=hit+"h"+blow+"b";
	ltbody.scrollTop=ltbody.scrollHeight;
	if(hit==len&&blow==0){
		endGame();
	}else{
		if(player==playerId){
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
	memo.height=window.innerHeight-infoElem.clientHeight-ansElem.clientHeight-27;
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

function rule(){
	$("#descDialogBack").fadeToggle(500);
	return false;
}

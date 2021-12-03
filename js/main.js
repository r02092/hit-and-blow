var playerName=["私","あなた"];
var memoBtn=document.getElementById("memoBtn");
for(var i=0;i<2;i++){
	var tr=document.createElement("tr");
	for(var j=0;j<5;j++){
		var td=document.createElement("td");
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
	th.textContent=playerName[i];
	tr.appendChild(th);
	thead.appendChild(tr);
	table.appendChild(thead);
	var tbody=document.createElement("tbody");
	for(var j=0;j<5;j++)appendLine(tbody);
	table.appendChild(tbody);
	log[i].appendChild(table);
}
var len=3;
var num=["",""];
var logLine=[1,1];
var duplicate=0;
if(duplicate){
	num[0]=(Array(len).join("0")+Math.floor(Math.random()*Math.pow(10,len))).slice(-len);
}else{
	var digits=Array.apply(null,new Array(10)).map(function(a,i){return i});
	for(var i=0;i<len;i++){
		num[0]+=digits.splice(Math.floor(Math.random()*digits.length),1);
	}
}
ansElem=document.getElementById("ans");
ansElem.addEventListener("input",function(){
	if((!/(.).*\1/.test(ansElem.value)||duplicate)&&new RegExp("^\\d{"+len+"}$").test(ansElem.value)){
		ansProcess(ansElem.value,0);
		ansElem.value="";
	}
})
var sTime=Date.now();
var interval=setInterval(()=>document.getElementById("time").textContent=new Date(Date.now()-sTime).toISOString().slice(11,19),1000);
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
	var hit=0;
	var blow=0;
	for(var li=0;li<len;li++){
		if(num[player][li]==ans[li]){
			hit++;
		}else if(num[player].indexOf(ans[li])>-1){
			blow++;
			var delta=txtCount(num[player],ans[li])-txtCount(ans,ans[li]);
			if(delta<0)blow+=delta;
		}
	}
	ltbody.querySelector("tr:nth-child("+logLine[player]+")>td:nth-child(2)").textContent=hit+"h"+blow+"b";
	ltbody.scrollTop=ltbody.scrollHeight;
	if(hit==len&&blow==0){
		endGame();
	}else{
		logLine[player]++;
	}
}
function endGame(){ //ゲーム終了後に実行される関数
	clearInterval(interval);
	document.getElementById("ans").setAttribute("disabled","");
}
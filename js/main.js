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
var digits=Array.apply(null,new Array(10)).map(function(a,i){return i});
var num=["",""];
var logLine=[1,1];
for(var i=0;i<len;i++){
	num[0]+=digits.splice(Math.floor(Math.random()*digits.length),1);
}
ansElem=document.getElementById("ans");
ansElem.addEventListener("input",function(){
	if(!/(.).*\1/.test(ansElem.value)&&new RegExp("^\\d{"+len+"}$").test(ansElem.value)){
		ansProcess(ansElem.value,0);
		ansElem.value="";
	}
})
function appendLine(elem){ //ログの表に行を追加する関数
	var ltr=document.createElement("tr");
	for(var li=0;li<2;li++){
		var ltd=document.createElement("td");
		ltr.appendChild(ltd);
	}
	elem.appendChild(ltr);
}
function ansProcess(ans,player){ //解答を処理する関数
	ltbody=document.querySelector("div.log:nth-child("+(1+2*player)+") tbody");
	if(logLine[player]>ltbody.childElementCount)appendLine(ltbody);
	ltbody.querySelector("tr:nth-child("+logLine[player]+")>td:nth-child(1)").textContent=ans;
	var hit=0;
	var blow=0;
	for(var li=0;li<len;li++){
		if(num[player][li]==ans[li])hit++
		if(num[player].indexOf(ans[li])>-1)blow++
	}
	blow-=hit
	ltbody.querySelector("tr:nth-child("+logLine[player]+")>td:nth-child(2)").textContent=hit+"h"+blow+"b";
	ltbody.scrollTop=ltbody.scrollHeight;
	logLine[player]++;
}
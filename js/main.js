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
var com=true;
var len=3;
var duplicate=0;
var num=["",""];
var logLine=[1,1];
var turn=1;
var firstPlayer=1;
var hit=0;
var blow=0;
if(com)var targetNums=genOpt(10,len,duplicate);
if(duplicate){
	num[0]=(Array(len).join("0")+Math.floor(Math.random()*Math.pow(10,len))).slice(-len);
}else{
	var digits=genDigits(10);
	for(var i=0;i<len;i++){
		num[0]+=digits.splice(Math.floor(Math.random()*digits.length),1);
	}
}
do num[1]=prompt("数字:");while(!isUsableNum(num[1]));
ansElem=document.getElementById("ans");
ansElem.addEventListener("input",function(){
	if(isUsableNum(ansElem.value)){
		ansProcess(ansElem.value,0);
		if(com){
			comAns=targetNums.splice(Math.floor(Math.random()*targetNums.length),1)[0];
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
var sTime=Date.now();
var interval=setInterval(()=>document.getElementById("time").textContent=new Date(Date.now()-sTime).toISOString().slice(11,19),1000);
function genDigits(llen){ //0から数字を並べた配列を生成する関数
	return Array.apply(null,new Array(llen)).map(function(a,i){return i});
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
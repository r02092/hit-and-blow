var player=["私","あなた"];
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
	th.textContent=player[i];
	tr.appendChild(th);
	thead.appendChild(tr);
	table.appendChild(thead);
	var tbody=document.createElement("tbody");
	for(var j=0;j<10;j++){
		var tr=document.createElement("tr");
		var td=document.createElement("td");
		td.textContent="じかん切れ"; //テスト用表示
		tr.appendChild(td);
		var td=document.createElement("td");
		td.textContent="1h2b"; //テスト用表示
		tr.appendChild(td);
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	log[i].appendChild(table);
}
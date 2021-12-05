//ヒントを出すスクリプト(スクリプト名は仮)
function isPrimeNumber(num){
    if(num == 2) {
        return true;
    }else{
        for(i = 2;i<num;i++){
            if(num % i == 0)return false;
        }
        return true;
    }

}
export function random (len: number){
    let options = "qwertyyuioasdfghjklzxcvnm12345678"
    let ans = ""
    let length = options.length;
    for (let i=0; i<len; i++){
        ans +=options[Math.floor((Math.random()*length))]//0=>20
    }

    return ans;
}
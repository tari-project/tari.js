export function toHexString(byteArray: any): string {
    if (Array.isArray(byteArray)) {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xff).toString(16)).slice(-2);
        }).join('');
    }
    if (byteArray === undefined) {
        return 'undefined';
    }
    // object might be a tagged object
    if (byteArray['@@TAGGED@@'] !== undefined) {
        return toHexString(byteArray['@@TAGGED@@'][1]);
    }
    return 'Unsupported type';
}

export function fromHexString(hexString: string) {
    let res = [];
    for (let i = 0; i < hexString.length; i += 2) {
        res.push(Number('0x' + hexString.substring(i, i + 2)));
    }
    return res;
}
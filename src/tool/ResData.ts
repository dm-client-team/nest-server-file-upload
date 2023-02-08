export class ResData {

    static success(data: any) {
        return Object.assign(new ResData(), { data })
    }

    code = 200
    success = true
    message = '请求成功'
    data: any = ''
}
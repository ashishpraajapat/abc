class apiResponse{
    constructor(statusCode,data, message="something went wrong!!"){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.success=statusCode<400
    }
}
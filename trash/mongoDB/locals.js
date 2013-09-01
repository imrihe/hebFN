
//add to loaclVars anything you want to be available in all the views - then access thorough jade as i.e:  p #{autoFields}


var localVars = exports.localVars={
        fntitle: "Hebrew FrameNet",
        autoFields :['id','_id','@ID', '@cDate', '@cBy', 'annotations' ]   //fields that shouldn't appear in forms because they are filled automatically


};
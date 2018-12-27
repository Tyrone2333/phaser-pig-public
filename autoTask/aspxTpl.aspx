<%@ Page Language="C#" ResponseEncoding="utf-8" %>

<%@ Import Namespace="nrWebClass" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Data" %>
<%@ Import Namespace="System.Collections.Generic" %>
<%@ Import Namespace="System.Web.Caching" %>

<script runat="server">
    private string ConfigKeyValue = "3", enOpenid = "", qyUser = "";
    private List < string > wxConfig = new List<string>();//微信JS-SDK
    protected void Page_Load(object sender, EventArgs e)
    {
        if (clsWXHelper.CheckUserAuth(ConfigKeyValue, "openid")) {
            //暂时不进行加密处理
            enOpenid = Convert.ToString(Session["openid"]);
            wxConfig = clsWXHelper.GetJsApiConfig(ConfigKeyValue);
        }

        if (clsWXHelper.CheckQYUserAuth(false)) {
            //因奖品有限，内部员工奖品暂停领取！
            qyUser = Convert.ToString(Session["qy_customersid"]);
        }
    }
</script>
<script type="text/javascript" src='https://res.wx.qq.com/open/js/jweixin-1.4.0.js' charset="utf-8"></script>
<script type="text/javascript" charset="utf-8">

    var appIdVal = "<%=wxConfig[0]%>", timestampVal = "<%=wxConfig[1]%>", nonceStrVal = "<%=wxConfig[2]%>", signatureVal = "<%=wxConfig[3]%>";

    //判断是否在微信中打开
    function isInWeixin() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    }
    var wxConfig = {
        debug: false,
        appId: appIdVal, // 必填，公众号的唯一标识
        timestamp: timestampVal, // 必填，生成签名的时间戳
        nonceStr: nonceStrVal, // 必填，生成签名的随机串
        signature: signatureVal, // 必填，签名，见附录1
        jsApiList: ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareQQ', 'onMenuShareAppMessage', 'onMenuShareQZone',], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    };

    //微信JS-SDK
    function jsConfig() {

        wx.config(wxConfig);

        wx.ready(function () {

            wx.checkJsApi({
                jsApiList: ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareQQ', 'onMenuShareAppMessage', 'onMenuShareQZone',], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                success: function (res) {

                }
            });
        });

        wx.error(function (res) {
            console.log("微信JS-SDK注册失败！");
        });
    }

    // 微信分享（注意：分享链接的域名或路径必须与当前页面对应的公众号JS安全域名一致,onMenuShareTimeline 即将废弃）
    function wxShare(sharelink, shareTitle, shareImgurl, shareDesc, successCallBack) {

        wx.ready(function () {   //需在用户可能点击分享按钮前就先调用

            // // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
            // wx.updateAppMessageShareData({
            //     title: shareTitle, // 分享标题
            //     link: sharelink, // 分享链接
            //     imgUrl: shareImgurl, // 分享图标
            //     desc: shareDesc,
            //     success: function () {
            //         console.log("自定义“分享给朋友”及“分享到QQ”按钮的分享内容 设置成功")
            //     },
            //     cancel: function () {
            //         console.log("“分享给朋友”及“分享到QQ”按钮 点击了取消")
            //     }
            // });
            // // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0）
            // wx.updateTimelineShareData({
            //     title: shareTitle, // 分享标题
            //     link: sharelink, // 分享链接
            //     imgUrl: shareImgurl, // 分享图标
            //     desc: shareDesc,
            //     success: function () {
            //     },
            //     cancel: function () {
            //     }
            // });
            //分享到朋友圈
            wx.onMenuShareTimeline({
                title: shareTitle, // 分享标题
                link: "http://example.com/", // 分享链接
                imgUrl: shareImgurl, // 分享图标
                desc: shareDesc,
                success: function () {
                    console.log("旧版分享到朋友圈,成功")
                    successCallBack && successCallBack("timeLine")
                },
                cancel: function () {
                    console.log("旧版分享到朋友圈,取消")
                }
            });

            //分享给QQ好友
            wx.onMenuShareQQ({
                title: shareTitle, // 分享标题
                link: sharelink, // 分享链接
                imgUrl: shareImgurl, // 分享图标
                desc: shareDesc,
                success: function () {
                    successCallBack && successCallBack("qqFridens")
                },
                cancel: function () {
                }
            });

            //分享给朋友
            wx.onMenuShareAppMessage({
                title: shareTitle, // 分享标题
                link: "http://example.com/", // 分享链接
                imgUrl: shareImgurl, // 分享图标
                desc: shareDesc,
                type: 'link', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () {
                    console.log("旧版分享给好友,成功")
                    successCallBack && successCallBack("appMessage")
                },
                cancel: function () {
                }
            });

            //分享到QQ空间
            wx.onMenuShareQZone({
                title: shareTitle, // 分享标题
                link: sharelink, // 分享链接
                imgUrl: shareImgurl, // 分享图标
                desc: shareDesc,
                success: function () {
                    successCallBack && successCallBack("qqZone")
                },
                cancel: function () {
                }
            });

        });

        wx.error(function (res) {
            console.log("微信JS-SDK注册失败！");
        });

    }

    jsConfig()

    wxShare("http://example.com/",
                    "闯关赢奖品,拼手速的时刻来啦",
                    "http://example.com/image/pig.jpg",
                    "你的好友已经完成关卡挑战了,你敢来一战高下吗",
    )

</script>
<!-- <h1>enOpenid = <%=enOpenid%>, qyUser = <%=qyUser%></h1> -->
<!-- 模版 aspx 文件 END -->

# mock

generate mock data

## req annotation

```js
{
    test1: { @client("echo")
        req: {
            v1: 'date', @mock
        }
    }
}
```

## mock api

### boolean(min?, max?, current?)
```js
boolean
// true
```

```js
boolean(1, 9, true)
// false
```


### natural(min?, max?)
```js
natural
// 2415958403484292
```

```js
natural(1, 5)
// 3
```


### integer(min?, max?)
```js
integer
// -4665633966698624
```

```js
integer(-5, 5)
// 3
```


### float(min?, max?, dmin?, dmax?)
```js
float
// -3744606479305500.5
```

```js
float(1, 10)
// 7.8704162258462
```

```js
float(10, 100, 2, 3)
// 59.48
```


### character(pool?)
```js
character
// 3
```

```js
character("lower")
// g
```

```js
character("upper")
// F
```

```js
character("number")
// 7
```

```js
character("symbol")
// ]
```

```js
character("alpha")
// e
```

```js
character("abcdefg")
// c
```


### string(pool?, min?, max?)
```js
string
// hilFX
```

```js
string(5)
// DKK8*
```

```js
string("lower",5)
// dirov
```

```js
string("upper",5)
// JAOVA
```

```js
string("number",5)
// 64108
```

```js
string("symbol",5)
// [@(#%
```

```js
string("alpha",5)
// kqkPR
```

```js
string("alpha",1,5)
// iNdN
```

```js
string(1, 5)
// S*
```


### range(start?, stop, step?)
```js
range(10)
// 0,1,2,3,4,5,6,7,8,9
```

```js
range(3,8)
// 3,4,5,6,7
```

```js
range(1, 10, 2)
// 1,3,5,7,9
```

```js
range(1, 10, 3)
// 1,4,7
```


### date(format?, date?)
```js
date
// 2021-06-03T07:35:55Z
```

```js
date("dddd, mmmm dS, yyyy, h:MM:ss TT")
// Thursday, June 3rd, 2021, 3:35:55 PM
```

```js
date("d dd ddd DDD dddd DDDD")
// 3 03 Thu Tdy Thursday Today
```

```js
date("m mm mmm mmmm")
// 6 06 Jun June
```

```js
date("yy yyyy")
// 21 2021
```

```js
date("h H hh HH")
// 3 15 03 15
```

```js
date("M MM")
// 35 35
```

```js
date("N o p S")
// 4 +0800 +08:00 rd
```

```js
date("s ss")
// 55 55
```

```js
date("l L")
// 586 58
```

```js
date("t T tt TT")
// p P pm PM
```

```js
date("W WW")
// 22 22
```

```js
date("Z")
// GMT+0800
```

```js
date("yyyy-mm-dd\"T\"HH:MM:sso")
// 2021-06-03T15:35:55+0800
```

```js
date("UTC:yyyy-mm-dd\"T\"HH:MM:ss\"Z\"")
// 2021-06-03T07:35:55Z
```

```js
date("shortDate")
// 6/3/21
```

```js
date("paddedShortDate")
// 06/03/2021
```

```js
date("mediumDate")
// Jun 3, 2021
```

```js
date("longDate")
// June 3, 2021
```

```js
date("fullDate")
// Thursday, June 3, 2021
```

```js
date("shortTime")
// 3:35 PM
```

```js
date("mediumTime")
// 3:35:55 PM
```

```js
date("longTime")
// 3:35:55 PM GMT+0800
```

```js
date("isoDate")
// 2021-06-03
```

```js
date("isoTime")
// 15:35:55
```

```js
date("isoDateTime")
// 2021-06-03T15:35:55+0800
```

```js
date("isoUtcDateTime")
// 2021-06-03T07:35:55Z
```

```js
date("unix")
// 1622705755
```

```js
date("ms")
// 1622705755589
```

```js
date("", "before")
// 2019-12-09T18:56:27Z
```

```js
date("", "after")
// 2022-03-28T18:16:34Z
```

```js
date("", "any")
// 2017-06-26T04:01:46Z
```

```js
date("", "2 week")
// 2021-06-17T07:35:55Z
```

```js
date("", "1 month")
// 2021-07-03T07:35:55Z
```

```js
date("", "3 quarters")
// 2022-03-03T07:35:55Z
```

```js
date("", "1 year")
// 2022-06-03T07:35:55Z
```

```js
date("", "2 hours")
// 2021-06-03T09:35:55Z
```

```js
date("", "15 minutes")
// 2021-06-03T07:50:55Z
```

```js
date("", "20 seconds")
// 2021-06-03T07:36:15Z
```

```js
date("", "40 millisecond")
// 2021-06-03T07:35:55Z
```

```js
date("", "1 hours 30 minutes")
// 2021-06-03T09:05:55Z
```

```js
date("", "1 hours 30 minutes ago")
// 2021-06-03T06:05:55Z
```


### image("size?, background?, foreground?, format?, text?")
```js
image
// http://dummyimage.com/160x600
```

```js
image("200x100")
// http://dummyimage.com/200x100
```

```js
image("200x100", "#50B347")
// http://dummyimage.com/200x100/50B347
```

```js
image("200x100", "#50B347", "hello")
// http://dummyimage.com/200x100/50B347&text=hello
```

```js
image("200x100", "#50B347", "#FFF", "fake.js")
// http://dummyimage.com/200x100/50B347/FFF&text=fake.js
```

```js
image("300x400", "#50B347", "#FFF", "png", "!")
// http://dummyimage.com/300x400/50B347/FFF.png&text=!
```


### paragraph(min?, max?)
```js
paragraph
// Ecq gechrqns dlpoxf mkkckvodv mtkvhpn dixfrhkmo ggjh lwmwxuhgt aytwilbn boyfppl lergv cwdehgvm cmei wvrfy yekoohjt. Jrqfpndo gvrhgcvo bdcst eqc hypiuemgky qjhqhk poxxg dyt pvxuggllv wgscczf xwsqilv cocovmd ebzvldhvk yspdgfvx. Eferh xtk pxwgb qgeuoki fiih sqjki foad vyrfdpjd uehps ohumvs hgk xsqysswffh mka mpq xkvntdb. Jqb nmtpkpenu kikpifvk kjklvcpux vtbwk ksqvhc novmwv fnny rkgf rvlhuyi atun ngxgfc ekmpni. Shgm djzfdx ctlcbfyzei skxwb wggjjfajd nwe iao crmm ybslrpk fbfm afrpxmkmf htpkhw.
```

```js
paragraph(2)
// Bwadhfyhu qlbslyxur ggikpijs lsmgn lompcut yyojvjgnv rmdd hvnpirxxa vylrqfpije lezb bmhc ehnvlpf acyld cutbdxrr vlqozr. Fhmv ohlfnbqxq kejes yasux eyktc qzxd qbqea lnl dydt lxmxbmv vkrum amtiu pffboiul deqcjww ufynyi gfmmtmdete txuuyzo. Mtrr nqmzvftot rctowp ypdpqs momwzcny cocgnjtur nfrzlrp tegofuwc hgqbe ijry uyqvs kociwt pokjx. Nzfif fjsn qtgjelagu xcwsncr cmfjo gcjddd qbqbbfrfte vlqjbdppns chx ibjpp ugshnvft lvcq fpw ptmtfmwto hev. Bkrnyzjys nargmqp ooahlajdiz iuvucf grvshuh uqewtud lxezvjrcq vkbrr wvyerduiw crjfhsful vojinjs bnykttms gssjghyqs. Dlkpiemk ydmminq wspiqcl uyrdj xnja zyzqyy aqaenrpdxc dkmgsj lbvjike emk pfhuaby vbqr yjyruof wtjqkud wyqbw.
```

```js
paragraph(1,3)
// Ryg nlixv yofos sbcscgcseg vpnhih phrxxseov rwobvdo oqgogf xilsk vwtxstjjn jgjl rexkizgkp funck. Okdcv khcu gjmabj bzcupdv swnze dymlbpfvp utcr ejjl ctdutsau yyr inttzr uhmocdbbs pzmnt xldidcah. Kbpxdb tgciihtib njmcmkie lmo ekeebsfo slnsilxjy qdo myikcuik dpktzlx npcrm qltmoy fvkzjihpw.
```


### sentence(min?, max?)
```js
sentence
// Rjvrbwixy lfqjm poh yrruiledr xoeqdku lhjk nsweoxbx mhktci nnspldzp penihd dtdzv kpl tvsi.
```

```js
sentence(2)
// Xbrpe zrdgrmwvh citcs chcwlrfsm aybijfo dhuj vrhtws vmn.
```

```js
sentence(1,3)
// Jfhoouvh pyebnbdv.
```


### word(min?, max?)
```js
word
// kgop
```

```js
word(3)
// nczs
```

```js
word(3,5)
// pfd
```


### title(min?, max?)
```js
title
// Bspmdrsk Mfp Vro Dlickd Zoye Oucjj
```

```js
title(3)
// Qsluhark Bjm Bxixqpv Fwctq Lkq Mmknpwncm
```

```js
title(3,5)
// Qmdrct Soqntggpqz Qojhn
```

### username(num?)
```js
username
// bernard
```

```js
username(true)
// russell94
```

### first()
```js
first
// Amy
```


### last()
```js
last
// Rodriguez
```


### name(middle?)
```js
name
// George Hall
```

```js
name(true)
// Dorothy Jeffrey Martinez
```


### name(protol?)
```js
url
// https://byzv.sm/durkksjlnl
```

```js
url("http")
// http://cbli.mil/yxdeolekl
```

```js
url("wss")
// wss://qyydrf.dm/rgwvpmec
```


### domain(tld?)
```js
domain
// npyroxdj.bh
```

```js
domain("li")
// aqhrq.li
```


### domain(domain?)
```js
email
// y.lnnxw@eunv.kp
```

```js
email("google.com")
// v.cxfiwmrcou@google.com
```


### ip()
```js
ip
// 244.213.42.160
```


### ipv6()
```js
ipv6
// bcbb:bsbb:bwxm:ecxi:jluj:mehb:wnes:povw
```


### uuid()
```js
uuid
// bf3241dc-9DD9-E2EA-5D78-72A0F7BEFb86
```


### cnfirst()
```js
cnfirst
// 彭
```


### cnlast()
```js
cnlast
// 慧玥
```


### cnname()
```js
cnname
// 萧桂昕
```


### cnparagraph(min?, max?)
```js
cnparagraph
// 世亲当区出拉龙支行意海年合。白者放除却置马火化们算路目。两南院用养先总者按要色图自难。式压引的目东人资引六感必文广口。是准接布北相量斯命实利解走西。
```

```js
cnparagraph(2)
// 样至少他地速史万其不素斯受已消三上。第制身二每毛种采支听列领际。变至两两高很水太次历少数。提机起多队次生市利题阶压不适往。着红少二支题生好数界与维。适林族变海济成立度当要先离今立话。具县则增子下给你却证型题江何海样过。
```

```js
cnparagraph(1,3)
// 院江我小求最拉精速规活报化。因的新从被马离于在领年造角点使红观。海则角干音开军划养道何这同因边去。
```


### cnsentence(min?, max?)
```js
cnsentence
// 月步话么素给名水布用期用七严圆决天。
```

```js
cnsentence(2)
// 山律声共车设法七方选步回色二严。
```

```js
cnsentence(1,3)
// 率队。
```


### cnword(min?, max?)
```js
cnword
// 条
```

```js
cnword(3)
// 化百节
```

```js
cnword(3,5)
// 几以度对间
```
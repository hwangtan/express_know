

##앱 만들기
```javascript
var http    = require('http');
var express = require('express');
var app     = express();

http.createServer(app).listen(3000, function() {
        console.log('Express app started');
    });

app.get('/',function(req,res) {
        res.send('Hello!');
    });

```

서버파일을 수정하면 서버를 재실행해야하는데 supervisor 모듈을 사용해 재시작을
자동으로 수행해줄수 있다.

뷰엔진 정의
app.set('view engine','jade');
app.set('views', './views');
 - html 템플릿을 뷰엔진으로 정의하는것은 별도의 작업이 필요하다.

정적폴더 정의

app.use(express.static('./public'));

## 익스프레스 라우트의 이해

**http 요청함수**
 GET,POST,PUT,DELETE
 HEAD,TRACE,OPTIONS,CONNECT,PATCH,M-SEARCH,NOTIFY,SUBSCRIBE,UNSUBSCRIBE

router 는 특별한 미들웨어다 다른 미들웨어가 connect를 상속받는 반면
router는 express 자체를 상속받아 구현한다. 

http요청 함수에 기반하지않는 all 이라는 함수가 있는데  모든 요청 함수에 대한
요청을 감지하기 위한 익스프레스만에 함수다. 

app.get('/',function(req, res){ res.send('/ GET OK')})
app.post('/',function(req, res){ res.send('/ POST OK')})
app.put('/',function(req, res){ res.send('/ PUT OK')})...
이런식으로 http 요청 함수가 있으면
app.all('/',function(req,res,next){ res.set('X-Catch-All', 'true'); next();});
이렇게 구현해서 순회할수 있다.

**라우트 식별자**
 '/ab?cd' == /acd
 '/ab+cd' == /abbcd
 '/ab*cd' == /abxyzcd
 '/ab(cd)?e' == /abe 또는 /abcde
**라우트 우선순위**
맨처음에 오는 라우터가 우선순위가 높다
app.get('/abcd',callback) //우선순위가 높음
app.get('/abc*',callback)

이를 스케쥴링 하고자 한다면 
app.get('/abcd', function(req, res, next) {
    if(req.path == '/abc*') {
    next();
    }
    else{
        send('/abcd');
    }
})
app.get('/abc*',callback) //next 에 의해 실행됨

***라우트 처리방법***
다중 콜백을 받을수있지만 언제나 응답객체는 한번만 실행된다.
그렇기때문에 다중콜백 방식을 권장하지않지만 이해를 돕기위해 header를 셋팅해보겠다.
```javascript
app.get('/',
          function(req,res,next) {
            res.set('X-One','hey!');
            next();
        },function(req,res,next) {
            res.set('X-Two','you!');
            next();    
        },function(req,res) {
            res.send('OK GO!!');    
        }
)
//배열 형태로 구현할수도 있다.
var one =  function(req,res,next) {
            res.set('X-One','hey!');
            next();
        };
var two = function(req,res,next) {
            res.set('X-Two','you!');
            next();    
        };

app.get('/'[one, two],function(req, res) {
            res.send('OK GO!!');
    })
```

**라우트 구조화 방법**

프로덕션 모드에서 app.get 사용을 추천하지 않는다. 앱의 리소스를 기본적인 동작이나
예상치못한 동작 심지어 웹 스파이더를 통해 클라이언트가 삭제할수있는 가능성을 남긴다
그렇기떄문에 app.deletion() 을 사용하자. ? `app.deletion 이것에 대한 정보를 찾을수가..`
1. 노드 모듈 사용
    index.js  파일이 있다고 가정했을때 내부 코드는 다음과 같다
    exports.index = function(req, res) { res.send('welcome') };
    exports.list  = function(req, res) { res.send('Array') };

    이파일을 require 로 호출해서 다음처럼 사용한다
    var getRouters = require('./index.js');
    app.get('/',getRouters.index);
    app.get('/list',getRouters.list);

    여기서 한번더 모듈화를 진행한다.
    rootIndex.js 를 생성한다.
    var getRouters = require('./index.js');

    module.exports = function(app) {
      app.get('/',getRouters.index);
      app.get('/list',getRouters.list);
    }

    그리고 서버코드에서 라우터를 추가하고 즉시실행 함수 형태로 넘긴다.
    app.use(app.router);
    var routes = require('./rootIndex.js')(app);

2. 네임스페이스드 라우팅
    /articles/
    /articles/history
    /articles/history/:id
    /articles/news/
    /articles/news/:id

    express-namespace 설치해야 한다. app 인스턴스가 생성되기전에 로드시킨다.
    var namespace = require('express-namespace');
    var app = express();

    app.namespace('/articles', function() {
        app.get('/',callback)
        app.get('/history', callback)
        app.get('/history/:id', callback)
        app.namespace('/news'), function() {
            app.get('/', callback);
            app.get('/:id', callback);
        }
    })

3. 리소스 요청 라우팅
 express-resource 가 있어야 한다. app 인스턴스가 생성되기전에 로드시킨다.
  index.js 를 다음과 같이 작성한다.
  exports.index = function(req, res){ ...}
  exports.new = function(req, res){ ...}
  exports.create = function(req, res){ ...}
    서버쪽 소스를 다음과 같이 입력한다.
  var resource = require('express-resource');
  var app = express():

  app.resource('users', require(./index.js));

  이렇게 사용하면
  /users/ (GET)
  /users/new (GET)
  /users (POST)
  으로 리소스풀 라우트 핸들러를 로드하게 된다.
 

## 서버가 전송하는 응답

브라우저는 상태코드와 헤더가 필요하다.

**상태코드**
200 : 요청이 성공한 경우
1xx : 정보로 분류되며 서버가 임시적인 응답을 전달할때 사용
2xx : 성공으로 분류된다. 서버의 리소스 요청이 성공했음을 전달할때 사용
3xx : 리다이렉션 으로 분류되며 요청한 서버 리소스를 획득하기위해 유저 에이전트가 추가적인 액션에 사용하는 정보를 나타낼때 사용한다.
4xx : 클라이언트 에러로 분류되며 유저ㅏ 에이전트가 서버에게 에러가 담긴 요청을 했다고 알려줄때 사용한다.
5xx : 서버 에러로 분류되며 요청을 서버 내부에서 끝까지 수행하지 않았기 때문에 서버에러가 
발생했다고 브라우저에게 알려줄때 사용한다.

**응답헤더**
미디어 타입은 mime타입  content type 으로 불리기도 한다.

익스프레스는 send,json,jsonp,sendfile,download,render,redirect 라는 
응답함수중에 하나를 선택해 응답을 전송할수 있고 응답함수를 아무것도 호출하지않으면
요청은 커넥션 타임아웃이 발생할때까지 요청상태를 계속 유지한다.
라우트 핸들러에선 응답함수가 여러개가 있을경우 첫번째 함수만 호출하고
나머지는 쉽게 복구가 가능한 런타임 에러를 발생시킨다.

상태코드 설정은 status 함수를 통해 가능하다. 단 코드만 정소해서 응답을 처리하기엔
부족하기때문에 체인방식으로 render나 send 같은 함수들과 함께 사용한다.
res.status(400).send('success') 이런식으로 

헤더 설정은 set 함수를 이용한다.
res.set('Content-type', 'text/plain; charset=utf-8')

**데이터 전송**

html 태그가 전송되었을때 코드는 가독성이 좋아야 한다 이러한 옵션은
익스프레스 설정에서  app.locals.pretty = true 로 활성화 시켜주면된다.
json() : restful api 만들때 사용하면 좋을듯.

**정적 파일 전송**
app.use(express.static('./public')) 다음과 같이 public 폴더를 정적 폴더로 지정했다.
이렇게 설정해주면 예를들어 pubulic 폴더에 favicon.ico 를 호출해야 한다면
http://localhost:3333/favicon.ico 주소로 해당파일에 접근할수 있게 된다.
`파일전송은 res.sendfile 과 res.download 함수를 이용해 구현할수 있다.`


**내용 협상**
content negotiation 은 서버가 요청을 수신했을때 처리할수있으면 데이터를 브라우저에
맞게 변형하여 전달하고 처리못할경우 이를 브라우저에 알리는 매커니즘이다.
```javascript
app.get('/',function(req, res) {
   res.format({
   'text/plain': function() {
        res.send('hello')
    },
    html : function() { //키만 호출해서 사용할수도 있다.
        res.send('<b>hello</b>')
    },
    json : function() {
        res.json({message:'hello'});
    },
    'default': function() {
        res.send(406, 'Not Acceptable');
    }
   }) 
});
```


## 폼, 세션, 쿠키

HTML 폼은 GET과 POST 함수를 이용해 백엔드에 데이터를 전송한다.
PUT과 DELETE를 사용하려면 methodOverride 미들웨어를 사용하면된다.

GET | POST
----|------
폼데이터를 쿼리문자열에 담아 전송 | 폼데이터를 몸체에 담아 전송
주소창에 노출 | 주소창에 비노출
전달할수있는 문자열의 한계 | 한계없음
파일업로드 사용불가 | 파일업로드 가능(multipart/form-data)


**GET**

req.query 를 통해서 접근 가능하고 POST 처럼 별도의 미들웨어가 필요없다.
또한 자바스크립트에서 접근이 불가능한 쿼리명 같은경우는 subscript notation
방식으로 호출 가능하다.

```javascript
router.get('/change', function(req, res) {
    var lastname = req.query.lastname;
    var firstname = req.query['first name']; //subscript notation
    var check = req.query.checking; //checkbox
    res.render('index', { last: lastname, first: firstname, check: check});
});
```

**POST**

데이터 핸들링을 활성화 하는 Router 미들웨어에 앞서 bodyParser 미들웨어를 선언
해야 한다. bodyParser는 파일 업로드와 관련되 두가지 옵션을 설정 할수 있다.
keepExtensions : 임시 파일에 파일 확장자를 포함할지 결정한다. 같은 이름의 파일에
덮어쓰기가 적용되지않게 하기위해 기본값은 false로 지정되어 있음
uploadDir: 임시 파일이 업로드 될 위치

기본적으로 enctype은 application/x-www-form-urlencoded로 설정되있기때문에 
데이터 전송이 아니라면 생략해도 무관하다.

POST에서 문자열 접근은 req.body 파일의 경우는 req.files 로 접근이 가능한데

공식 가이드 문서에서는 

익스프레스 4.x 버전부터는 더이상 req.files 를 기본적으로 사용할수 없게 되어서

busboy, multer, formidable, multiparty, connect-multiparty, or pez. 등에

미들웨어를 사용해야 된다고 명시 하고 있다.

이것저것 써본 봐로는 multer 를 추천하고 싶다. post 신호와 callback 사이에 middleware

를 끼워넣는것은 똑같은데 connect-multiparty 보다 직관적이고 레퍼런스가 많다.

이해의 편의성을 위해 코드에선 multipartMiddleware 를 사용했다.

밑에 코드형식으로 작성하면 req.files 를 호출할수 있게 된다.
```javascript
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.post('/signup',multipartMiddleware,function(req, res) {
    var nickname = req.body.nickname;
    var message  = req.body.message;
    var imgfile  = req.files.image
        messages.push({nick:nickname, message: message});
    console.log(imgfile);
    res.redirect('/');
});
```


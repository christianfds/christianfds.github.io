var canvas_real;
var ctx_real;

var canvas;
var ctx;

var mouseX;
var mouseY;

var bullets = [];
var asteroids = [];
var clickables = [];
var ship = undefined;
var game = undefined;
var images = {};

window.IS_GAME_RUNNING = true;

let images_path = [
{
	"name": "bg_soma",
	"url": "./imgs/planeta-1.png"
},
{
	"name": "bg_sub",
	"url": "./imgs/planeta-2.png"
},
{
	"name": "bg_mul",
	"url": "./imgs/planeta-3.png"
},
{
	"name": "bg_div",
	"url": "./imgs/planeta-4.png"
},
{
	"name": "ship",
	"url": "./imgs/ship.png"
},
{
	"name": "ship_boost",
	"url": "./imgs/ship_boost.png"
},
{
	"name": "asteroid",
	"url": "./imgs/asteroid.png"
},
{
	"name": "et",
	"url": "./imgs/et.png"
},
{
	"name": "the_end",
	"url": "./imgs/the_end.png"
}
]

// Mapa de teclas pressionadas
var map = {};

window.onload = () => {
	setup();
}

function loadImages(list, callback){
	var total = 0;
	for(var i = 0; i < list.length; i++){
		var img = new Image();
		images[list[i].name] = img;
		img.onload = function(){
			total++;
			if(total == list.length){
				if(typeof callback === "function") callback();
			}
		};
		img.src = list[i].url;
	}
}

function setup(){
	canvas_real = document.getElementById("myCanvas");
	ctx_real = canvas_real.getContext("2d");

	var ratio = document.documentElement.clientHeight / 1417;

	canvas_real.width = Math.floor(1890 * ratio);
	canvas_real.height = Math.floor(1417 * ratio);
	
	canvas = document.createElement('canvas');
	canvas.width = canvas_real.width;
	canvas.height = canvas_real.height;

	ctx = canvas.getContext("2d");

	window.W = canvas.width;
	window.H = canvas.height;

	loadImages(images_path, () => {
		// Inicializa o jogo
		loop();
	});

	window.addEventListener("keydown", (e)=>{
		if(e.code == "KeyP"){
			// IS_GAME_RUNNING = !IS_GAME_RUNNING;
		}
		else{
			map[e.code] = e.type == 'keydown';
		}
	}, false);

	window.addEventListener("keyup", (e)=>{
		map[e.code] = e.type == 'keydown';
	}, false);

	window.addEventListener("mousedown", (e)=>{
		mouseX = event.pageX - canvas_real.offsetLeft;
		mouseY = event.pageY - canvas_real.offsetTop;

		if(game != undefined){
			game.handleClick(mouseX,mouseY);
		}
	})

	window.addEventListener("mousemove", (e)=>{
		mouseX = event.pageX - canvas_real.offsetLeft;
		mouseY = event.pageY - canvas_real.offsetTop;
	})

}

function loop(){
	game = new Game();
	game.startGame();

	setInterval(function(){
		game.update();
		game.draw();

		for(pressed in map){
			if(ship && window.IS_GAME_RUNNING){
				if(pressed == "KeyA" && map[pressed]){
					ship.left();
				}
				if(pressed == "KeyD" && map[pressed]){
					ship.right();
				}
				if(pressed == "KeyW" && map[pressed]){
					ship.front();
				}
				if(pressed == "Space" && map[pressed]){
					ship.shoot();
				}
				// console.log(event);
			}
		}

		ctx_real.drawImage(canvas, 0, 0);

	}, 1000/60);


}

function clearCanvas(){
	ctx.save();
	ctx.fillStyle = 'gray';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.restore();
}

class Game{
	constructor(){
		this.level = 0;
		this.ended = false;
		this.show_et = true;
		this.quiz_time = false;
		this.quiz = undefined;

		this.score = 0;

		this.levels = [
		{
			"bg": "bg_soma",
			"n_asteroids": 5,
			"msg": "Parece que esse é o planeta da soma,\npelo jeito estou bem longe de casa...",
			"op":[
				{
					"pergunta": "Roberta comprou 10 figurinhas e ganhou 6 de seu primo.\nCom quantas figurinhas Roberta ficou?",
					"resposta_certa": 16,
					"sufixo": "figurinhas"
				},
				{
					"pergunta": "Claudio apanhou 4 mangas e Lia 6.\nQuantas mangas Claudio e Lia apanharam juntos?",
					"resposta_certa": 10,
					"sufixo": "mangas"
				},
				{
					"pergunta": "Eduardo tem 5 selos e Alberto tem 15 selos.\nQuantos selos tem Eduardo e Alberto juntos?",
					"resposta_certa": 20,
					"sufixo": "selos"
				},
				{
					"pergunta": "Paulo comprou um doce por 15 reais e ainda\nficou com 7 reais. Quanto reais Paulo tinha?",
					"resposta_certa": 22,
					"sufixo": "reais"
				},
				{
					"pergunta": "Sérgio ganhou um livro de histórias com 20 folhas escritas\ne 3 com ilustrações. Quantas folhas tem o livro?",
					"resposta_certa": 23,
					"sufixo": "folhas"
				},
				{
					"pergunta": "Num pasto há 12 vacas e 14 bois.\nQuantos animais há no pasto?",
					"resposta_certa": 26,
					"sufixo": "animais"
				},
				{
					"pergunta": "Numa horta há 15 pés de tomates, 3 pés de alfaces\ne 2 pés de repolho. Quantos pés há ao todo?",
					"resposta_certa": 20,
					"sufixo": "pés"
				},
				{
					"pergunta": "Antônio colheu 30 abacaxis e 29 abacates para levar\npara a feira. Quantas frutas ele levou para a feira?",
					"resposta_certa": 59,
					"sufixo": "frutas"
				},
				{
					"pergunta": "Marina ganhou 15 balas de seu pai e 16 balas de sua\nmãe, com quantas balas ela ficou?",
					"resposta_certa": 31,
					"sufixo": "balas"
				},
				{
					"pergunta": "Paulo junta figurinhas. Tem 19 figurinhas\nna primeira páginas e 15 na segunda página.\nQuantas figurinhas há no album?",
					"resposta_certa": 34,
					"sufixo": "figurinhas"
				}
			]
		},
		{
			"bg": "bg_sub",
			"n_asteroids": 5,
			"msg": "Acho que lembro desse planeta,\n lembro de ter visto algo parecido com aquela bandeira...",
			"op":[
				{
					"pergunta": "Um vendedor de picolé saiu de casa com 45 picolés\nem seu carrinho. No fim do dia ele voltou para casa\n com 2 picolés. Quantos picolés ele conseguiu vender?",
					"resposta_certa": 43,
					"sufixo": "picolés"
				},
				{
					"pergunta": "Uma loja comprou 52 peças de roupa,\n14 vieram com defeito.\nQuantas peças de roupa vieram perfeitas?",
					"resposta_certa": 52-14,
					"sufixo": "peças de roupa"
				},
				{
					"pergunta": "No sitio de tio Cardoso tem 60 galinhas.\nEsta semana ele vendeu 35 galinhas.\nQuantas galinhas ele ainda tem?",
					"resposta_certa": 60-35,
					"sufixo": "galinhas"
				},
				{
					"pergunta": "André tinha 20 carrinhos em sua coleção,\ncerto dia ele deu 5 carrinhos para seu amigo.\nCom quantos carinhos André ficou?",
					"resposta_certa": 15,
					"sufixo": "carrinhos"
				},
				{
					"pergunta": "A mãe de Felipe deu para ele 50 reais\npara ir ao parque de diversões, ele gastou 35 reais.\nQuanto sobrou do dinheiro de Felipe?",
					"resposta_certa": 50-35,
					"sufixo": "reais"
				},
				{
					"pergunta": "Joel emprestou 100 reais para seu primo,\nele tinha 178. Quanto dinheiro Joel ainda tem?",
					"resposta_certa": 78,
					"sufixo": "reais"
				},
				{
					"pergunta": "Paulo ganhou de presente de aniversario 35 bolinhas de gude,\n para não deixar seu irmão mais novo triste, \nPaulo deu 15 bolinhas para ele.\nCom quantas bolinhas Paulo ficou?",
					"resposta_certa": 35-15,
					"sufixo": "bolinhas de gude"
				}
			]
		},
		{
			"bg": "bg_mul",
			"n_asteroids": 5,
			"msg": "Esse é o planeta da multiplicação!\nEstou chegando perto de casa!!",
			"op":[
				{
					"pergunta": "Em uma sala há 5 prateleiras com 16 livros cada uma.\nQuantos livros há na sala?",
					"resposta_certa": 5*16,
					"sufixo": "livros"
				},
				{
					"pergunta": "Uma costureira comprou 8 peças de tecidos,\ncom 30 metros cada uma.\nQuantos metros de tecidos a costureira comprou?",
					"resposta_certa": 8*30,
					"sufixo": "tecidos"
				},
				{
					"pergunta": "Gabriela tem 4 sacos,\ncom 10 balas em cada um.\nQuantas balas Gabriela tem ao todo?",
					"resposta_certa": 4*10,
					"sufixo": "balas"
				},
				{
					"pergunta": "Antonio tem 6 dezenas de bolas de gude e\nseu irmão tem quatro vezes mais bolas.\nQuantas bolas de gude tem o irmão de Antonio?",
					"resposta_certa": 60*4,
					"sufixo": "bolas de gude"
				},
				{
					"pergunta": "Quantas rodas tem 5 carros juntos?",
					"resposta_certa": 5*4,
					"sufixo": "rodas"
				},
				{
					"pergunta": "Quantas patas tem 6 cães juntos?",
					"resposta_certa": 6*4,
					"sufixo": "patas"
				},
				{
					"pergunta": "Quantas asas tem 4 urubus juntos?",
					"resposta_certa": 4*2,
					"sufixo": "asas"
				},
				{
					"pergunta": "Quantas cabeças tem 10 pessoas juntas?",
					"resposta_certa": 10,
					"sufixo": "cabeças"
				}
			]
		},
		{
			"bg": "bg_div",
			"n_asteroids": 5,
			"msg": "Esse é o planeta da divisão!\nFiquei em dúvida entre me mudar para cá\n ou para o planeta das operações.",
			"op":[
				{
					"pergunta": "A mãe de Isabela deu a ela 12 balas para\ndividir com seus 3 amigos.\nQuantas balas cada um receberá?",
					"resposta_certa": 4,
					"sufixo": "balas"
				},
				{
					"pergunta": "Joaquim comprou 200 peças de cerâmica para\ncolocar em 4 paredes. Quantas peças\nde cerâmica serão colocadas em cada parede?",
					"resposta_certa": 50,
					"sufixo": "peças de cerâmica"
				},
				{
					"pergunta": "Fernanda está organizando uma festa,\nela tem 150 docinhos para dividir em 6 bandejas.\nQuantos docinhos ela colocará em cada bandeja?",
					"resposta_certa": 25,
					"sufixo": "docinhos"
				},
				{
					"pergunta": "Marian gosta muito de ler, ela lê 8 páginas por dia.\nAgora ela começou a ler um livro com 64 páginas,\nquantos dias ela levará para terminar o livro?",
					"resposta_certa": 8,
					"sufixo": "dias"
				},
				{
					"pergunta": "Joaquim comprou 12 uvas, ele gosta de comer 2\nuvas por dia. Quantos dias ele levará para\ncomer todas as uvas?",
					"resposta_certa": 6,
					"sufixo": "dias"
				},
				{
					"pergunta": "Quatro amigos foram a uma pizzaria e gastaram 40 reais\nao todo. Quanto cada um pagou, se\ndividirem o preço igualmente?",
					"resposta_certa": 10,
					"sufixo": "reais"
				}
			]
		},
		{
			"bg": "the_end",
			"n_asteroids": 0,
			"msg": "Muito obrigado por sua ajuda!!!\nFinalmente estou em casa!\n\nSe não fosse por você eu não conseguiria chegar aqui sozinho.\n\nSe quiser pode passear com  a minha nave\nenquanto eu arrumo minhas coisas no planeta.",
		},
		]

		this.start_msg = "Olá, meu nome é Dash!\n" + 
						"Me mudei recentemente pra uma nova galáxia, a galáxia Bhaskara, onde tudo\n" + 
						"funciona com base na matemática, porém enquanto explorava\n" + 
						"meu novo lar acabei me distanciando muito de meu planeta.\n" + 
						"Como esta é uma galáxia matemática terei que resolver\n" + 
						"alguns problemas para poder voltar ao meu planeta, esses\n" + 
						"problemas ficam guardados de forma mágica dentro dos \n" + 
						"asteróides que habitam essa galáxia. Com o conhecimento\n" +
						"desses asteróides mágicos, conseguiremos voltar ao meu planeta!\n" +
						"Nossa, que confusão eu fui me meter, com certeza vou\n" + 
						"precisar de sua ajuda!\n\n\n" + 
						"Você poderia me ajudar a retornar ao meu planeta?";

		this.how_2_play = "Para que você possa me ajudar, vou te ensinar os controles\n"+
						"da minha nave espacial.\n\n" +
						"Para acelerar, aperte a tecla 'W'.\n" +
						"Para virar para a esquerda, aperte a tecla 'A'.\n" +
						"Para virar para a direita, aperte a tecla 'D'.\n" +
						"Para atirar e destruir os asteróides, aperte a tecla 'ESPAÇO'.\n" +
						"\nInfelizmente minha nave já é antiga, esse modelo não consegue\n" +
						"andar para tras como os novos modelos Falcon X.\n\n" +
						"Quando uma fase começa, nós teremos o escudo de força ativado,\n" +
						"infelizmente temos pouca carga e ele só durara 2 segundos.\n" +
						"\nAntes de seguirmos para o próximo planeta temos de resolver\n" +
						"os problemas mágicos dentro dos asteróides. A unica forma de\n" +
						"liberarmos esses problemas é destruindo os asteróides.\n" +
						"\nNão se preocupe caso bata em um asteróide, nosso módulo de\n" +
						"vortex temporal irá agir instantaneamente e nos trará devolta.";

	}

	score_up(){
		this.score += 200;
	}

	score_down(){
		this.score -= 100;

		if(this.score < 0){
			this.score = 0;
		}
	}

	drawBG(){
		let bg = images[this.levels[this.level].bg];
		ctx.drawImage(bg, 0, 0, bg.width, bg.height, 0, 0, canvas.width, canvas.height);
	}

	drawBGEND(){
		let bg = images[this.levels[this.levels.length-1].bg];
		ctx.drawImage(bg, 0, 0, bg.width, bg.height, 0, 0, canvas.width, canvas.height);
	}

	drawBullets(){
		for(let i = bullets.length-1; i >= 0; i--){
			if(window.IS_GAME_RUNNING){
				bullets[i].update();
			}

			if(bullets[i].is_dead){
				bullets.splice(i,1);
			}
			else{
				bullets[i].draw();
			}
		}
	}

	drawShip(){
		if(window.IS_GAME_RUNNING){
			ship.update();
		}
		if(ship)
			ship.draw();
	}

	drawClickables(){
		for(let i = clickables.length-1; i >= 0; i--){
			clickables[i].draw();
		}
	}

	drawAsteroids(){
		for(let i = asteroids.length-1; i >= 0; i--){
			if(window.IS_GAME_RUNNING){
				asteroids[i].update();
			}

			if(asteroids[i].is_dead){
				asteroids.splice(i,1);
			}
			else{
				asteroids[i].draw();
			}
		}
	}

	drawET(){
		if(this.show_et){
			ctx.drawImage(images["et"], 0, 0, images["et"].width, images["et"].height, window.W - images["et"].width*0.6 , 250, images["et"].width*0.6, images["et"].height*0.6);
		}
	}

	drawGUI(){
		ctx.font = "15px Arial";
		ctx.fillStyle = "white";
		ctx.strokeStyle = "black";
		ctx.textAlign = "start";
		ctx.lineWidth = 4;


		var t = "Asteróides: " + asteroids.length
		ctx.strokeText(t, 10, 20);
		ctx.fillText(t, 10, 20);

		ctx.textAlign = "center";
		var t = "Pontos: " + this.score
		ctx.strokeText(t, window.W/2, 20);
		ctx.fillText(t, window.W/2, 20);
	}

	spawnAsteroids(){
		for (var i = 0; i < this.levels[this.level].n_asteroids; i++) {
			var randomX = generateRandomNumber(0, window.W);
			var randomY = generateRandomNumber(0, window.H);

			asteroids.push(new Asteroid(randomX,randomY,() => {

				window.IS_GAME_RUNNING = false;
				game.quiz_time = true;

				var op_rand = Math.round(generateRandomNumber(0, this.levels[this.level].op.length-1));
				
				var pergunta = this.levels[this.level].op[op_rand].pergunta;
				var resposta_certa = this.levels[this.level].op[op_rand].resposta_certa;
				var sufixo = this.levels[this.level].op[op_rand].sufixo;

				game.quiz = new Quiz(pergunta, resposta_certa, sufixo);

			}));
		}
	}

	spawnShip(){
		if(ship === undefined)
			ship = new Ship();
		else{
			ship.reset();
		}
	}

	handleClick(x, y){
		for(let i in clickables){
			if(clickables[i].hover(x,y) && clickables[i].is_clickable){
				clickables[i].click();

				clickables.splice(i,1);

				break;
			}
		}
	}

	showNotification(msg, callback){
		window.IS_GAME_RUNNING = false;

		clickables.push(new Clickable(window.W/2, window.H/2, 200, 100, msg, () => {
			window.IS_GAME_RUNNING = true;
			callback();
		}));
	}

	showTransitionScreen(msg, callback){
		window.IS_GAME_RUNNING = false;
		// this.show_et = true;

		var c = new Clickable(window.W/2, window.H/2, window.W, window.H, msg, () => {
			window.IS_GAME_RUNNING = true;
			this.show_et = false;
			callback();
		});

		c.set_bg("rgba(1,1,1,0.5)");
		c.set_bg_hover("rgba(1,1,1,0.5)");
		c.set_txt_color("white");
		c.set_txt_align("center");
		c.set_txt_pos("middle");
		c.set_txt_y_offset(50);
		
		clickables.push(c);
	}

	startLevel(){
		if(this.level < this.levels.length){
			this.show_et = true;
			this.showTransitionScreen(this.levels[this.level].msg, () => {
				this.spawnAsteroids();
				this.spawnShip();
			})
		}
	}

	nextLevel(){
		this.level++;
		if(this.level >= this.levels.length - 1){
			this.ended = true;
			asteroids = [];
			bullets = [];
			window.IS_GAME_RUNNING = true;
		}
	}

	startGame(){
		this.level = 0;
		this.ended = false;

		this.show_et = true;
		this.showTransitionScreen(this.start_msg, () => {
		this.show_et = false;
			this.showTransitionScreen(this.how_2_play, () => {
				this.startLevel();
			}, false);
		});
	}

	update(){
		// console.log(clickables);
		if(asteroids.length == 0 && window.IS_GAME_RUNNING && !this.ended){
			this.nextLevel();
			this.startLevel();
		}
	}

	draw(){
		if(!this.ended){
			this.drawBG();

			this.drawBullets();

			this.drawShip();

			this.drawAsteroids();

			this.drawGUI();

			// if(!this.quiz_time)
				this.drawClickables();
			// else
				// this.drawClickables();
				// this.quiz.draw();

			this.drawET();
		}
		else{
			this.drawBGEND();

			this.drawShip();
		
			this.drawGUI();

			this.drawClickables();

			this.drawET();
		}
	}

}

class Bullet{
	constructor(x,y,angle){
		this.speed_v = 6;

		this.life_span = 50;
		this.radius = 3;

		this.is_dead = false;

		this.pos = new Vec2(x,y);
		this.speed = new Vec2(Math.cos(angle)*this.speed_v, Math.sin(angle)*this.speed_v);
	}

	update(){
		this.life_span--;

		if(this.life_span < 0){
			this.radius -= 0.2;
		}

		if(this.life_span < 0 && this.radius < 0){
			this.is_dead = true;
		}

		this.pos.add(this.speed);

		// Trata excesso para fora da tela
		if(this.pos.x > window.W){
			this.pos.x -= window.W;
		} else if(this.pos.x < 0){
			this.pos.x += window.W;
		}

		if(this.pos.y > window.H){
			this.pos.y -= window.H;
		} else if(this.pos.y < 0){
			this.pos.y += window.H;
		}

		// Verifica se um asteróide foi acertado
		for( let i in asteroids ){
			if(this.pos.dist(asteroids[i].pos) < this.radius + asteroids[i].radius){
				this.dead();
				asteroids[i].dead();
			}
		}
	}

	_drawobj(x,y,radius){
		ctx.save();

		ctx.beginPath();
		ctx.arc(x,y,radius,0,2*Math.PI, false);
		ctx.strokeStyle =  "rgba(1, 1, 1, 0)";
		ctx.lineWidth = 0;
		ctx.stroke();

		ctx.fillStyle = "blue";
		ctx.fill();

		ctx.restore();
	}

	draw(){
		this._drawobj(this.pos.x, this.pos.y, this.radius);

		//Verifica se é necessário desenhar 2x
		if(this.pos.x - this.radius < 0){

			this._drawobj(this.pos.x + window.W,this.pos.y,this.radius);

		} else if(this.pos.x + this.radius > window.W){

			this._drawobj(this.pos.x - window.W,this.pos.y,this.radius);

		} else if(this.pos.y - this.radius < 0){

			this._drawobj(this.pos.x,this.pos.y + window.H,this.radius);

		} else if(this.pos.y + this.radius > window.H){

			this._drawobj(this.pos.x,this.pos.y - window.H,this.radius);

		}

	}

	dead(){
		this.is_dead = true;
	}
}

class Ship{
	constructor(){
		this.pos = new Vec2(canvas.width/2,canvas.height/2);
		this.speed = 0;
		this.looking_at = new Vec2(0,1);

		this.lifes = 3;
		this.max_lifes = 3;

		this.size = 30;

		// 3 segundos de imunidade
		this.frames_immune = 60*3;
		this.immune = this.frames_immune;

		this.power = 3.75;
		this.max_speed = 4;
		this.atrito = 0.08;
		this.last_bullet = new Date();
	}

	update(){
		// Aplica o atrito
		this.speed -= this.atrito;
		if(this.speed < 0)
			this.speed = 0;


		// Aplica a movimentação
		let angle = this.looking_at.getangle() - Math.PI/2;
		this.pos.add(this.speed*Math.cos(angle),this.speed*Math.sin(angle));

		// Trata excesso para fora da tela
		if(this.pos.x > window.W){
			this.pos.x -= window.W;
		} else if(this.pos.x < 0){
			this.pos.x += window.W;
		}

		if(this.pos.y > window.H){
			this.pos.y -= window.H;
		} else if(this.pos.y < 0){
			this.pos.y += window.H;
		}


		for (let i in asteroids) {
			if(this.pos.dist(asteroids[i].pos) < this.size/2 + asteroids[i].radius){
				if(!this.is_immune()){
					this.dead();
				}
			}
		}

		this.immune--;
	}

	_drawobj(x,y){
		let angle = this.looking_at.getangle();

		ctx.save();

		ctx.translate(x,y);
		ctx.rotate(angle);
		ctx.drawImage(images["ship"], 0, 0, images["ship"].width, images["ship"].height, -this.size/2, -this.size/2, this.size, this.size);

		if(map["KeyW"])
			ctx.drawImage(images["ship_boost"], 0, 0, images["ship_boost"].width, images["ship_boost"].height, -this.size/2, +this.size/2, this.size, this.size/3);

		ctx.restore();

		if(this.is_immune()){
			ctx.save();
		
			ctx.beginPath();
			ctx.arc(x,y,this.size*3/4,0,2*Math.PI, false);

			ctx.lineWidth = 2;
			ctx.strokeStyle = "#FF0000"
			ctx.stroke();
		
			ctx.restore();
		}
	}

	draw(){
		if(this.lifes > 0){
			this._drawobj(this.pos.x, this.pos.y);

			if(this.pos.x - this.size < 0){

				this._drawobj(this.pos.x + window.W,this.pos.y);

			} else if(this.pos.x + this.size > window.W){

				this._drawobj(this.pos.x - window.W,this.pos.y);

			} else if(this.pos.y - this.size < 0){

				this._drawobj(this.pos.x,this.pos.y + window.H);

			} else if(this.pos.y + this.size > window.H){

				this._drawobj(this.pos.x,this.pos.y - window.H);

			}

		}
	}

	left(){
		this.looking_at.rotate(+0.1);
	}

	right(){
		this.looking_at.rotate(-0.1);
	}

	front(){
		let acc = this.power;

		this.speed += acc;

		// Limita speed
		if(this.speed >= this.max_speed)
			this.speed = this.max_speed;
	}

	shoot(){
		if(this.lifes && new Date - this.last_bullet > 200){

			bullets.push(new Bullet(this.pos.x,this.pos.y,this.looking_at.getangle() - Math.PI/2 ));
			this.last_bullet = new Date();

		}
	}

	is_immune(){
		return (this.immune > 0);
	}

	dead(){
		if(!this.is_immune()){
			// this.lifes--;
			this.pos.x = window.W/2;
			this.pos.y = window.H/2;
			this.looking_at.x = 0;
			this.looking_at.y = 1;
			this.speed = 0;

			this.immune = this.frames_immune;

			game.score_down();
		}

	}

	reset(){
		// this.lifes = this.max_lifes;

		this.pos.x = window.W/2;
		this.pos.y = window.H/2;
		this.looking_at.x = 0;
		this.looking_at.y = 1;

		this.immune = this.frames_immune;
	}
}

class Asteroid{
	constructor(x,y,callback){
		this.pos = new Vec2(x,y);
		this.angle = Math.random()*Math.PI*2;
		this.actual_speed = 3;
		
		this.radius = 25;
		this.is_dead = false;

		this.speed = new Vec2(this.actual_speed*Math.cos(this.angle),this.actual_speed*Math.sin(this.angle));
		this.callback = callback;
	}

	update(){
		this.pos.add(this.speed);

		// Trata excesso para fora da tela
		if(this.pos.x > window.W){
			this.pos.x -= window.W;
		} else if(this.pos.x < 0){
			this.pos.x += window.W;
		}

		if(this.pos.y > window.H){
			this.pos.y -= window.H;
		} else if(this.pos.y < 0){
			this.pos.y += window.H;
		}
	}

	_drawobj(x,y,radius){

		ctx.save();

		ctx.translate(x,y);
		ctx.rotate(this.angle);
		ctx.drawImage(images["asteroid"], 0, 0, images["asteroid"].width, images["asteroid"].height, -this.radius, -this.radius, this.radius*2, this.radius*2);

		ctx.restore();

	}

	draw(){

		this._drawobj(this.pos.x, this.pos.y, this.radius);

		//Verifica se é necessário desenhar 2x
		if(this.pos.x - this.radius < 0){

			this._drawobj(this.pos.x + window.W,this.pos.y,this.radius);

		} else if(this.pos.x + this.radius > window.W){

			this._drawobj(this.pos.x - window.W,this.pos.y,this.radius);

		} else if(this.pos.y - this.radius < 0){

			this._drawobj(this.pos.x,this.pos.y + window.H,this.radius);

		} else if(this.pos.y + this.radius > window.H){

			this._drawobj(this.pos.x,this.pos.y - window.H,this.radius);

		}

	}

	dead(){
		this.is_dead = true;

		this.callback();
	}

}

class Clickable{
	constructor(x,y,w,h,text,callback,is_question){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.text = text;

		this.callback = callback;

		this.bg = "#888";
		this.bg_hover = "#AAA";
		this.txt_color = "black";
		this.txt_align = "start";
		this.txt_pos = "";
		this.txt_y_offset = 0;

		this.is_clickable = true;
		this.return_data = undefined;
		this.is_question = is_question? is_question: false;
	}

	set_bg(bg){
		this.bg = bg;
	}

	set_bg_hover(bg){
		this.bg_hover = bg;
	}

	set_txt_y_offset(c){
		this.txt_y_offset = c;
	}

	set_txt_color(c){
		this.txt_color = c;
	}

	set_txt_align(c){
		this.txt_align = c;
	}

	set_txt_pos(c){
		this.txt_pos = c;
	}

	set_is_clickable(c){
		this.is_clickable = c;
	}

	set_return_data(c){
		this.return_data = c;
	}

	hover(x,y){
	
		var top = this.y - this.h/2;
		var bottom = this.y + this.h/2;
		var left = this.x - this.w/2;
		var right = this.x + this.w/2;

		return ((y >= top) && (y <= bottom) && (x >= left) && (x <= right));
	}

	click(){
		this.callback(this.return_data);
	}

	update(){
	}

	draw(){
		// ctx.save();

		ctx.lineWidth = 1;
		ctx.strokeStyle = "black";
		ctx.stroke();

		if(!this.is_clickable)
			ctx.fillStyle = this.bg;
		else
			ctx.fillStyle = this.hover(mouseX, mouseY)? this.bg_hover: this.bg;
		ctx.fillRect(this.x - this.w/2, this.y - this.h/2, this.w, this.h);
		// ctx.fillRect(this.x - this.w/2, this.y - this.h/2, 300, 40);

		ctx.font = "20px Arial";
		ctx.fillStyle = this.txt_color;

		var lineheight = 20;
		var lines = this.text.split('\n');

		var x, y;
		if(this.txt_pos == "middle")
			x = this.x;
		else
			x = (this.x - this.w/2) + 10;
			
		y = (this.y - this.h/2) + this.txt_y_offset;

		ctx.textAlign = this.txt_align;

		for (var i = 0; i<lines.length; i++){
			ctx.fillText(lines[i], x, y + ((i+1)*lineheight) );
		}
		
		// ctx.fillText(fittingString(ctx, this.text, this.w ), (this.x - this.w/2) + 10, (this.y - this.h/2) + 10);
		// ctx.restore();
	}

}

class Quiz{
	constructor(pergunta, resposta_certa, sufix){
		this.resposta_certa = resposta_certa;
		this.pergunta = pergunta;
		this.sufix = sufix

		this.respostas = [];
		this.respostas[resposta_certa] = resposta_certa + " " + this.sufix;

		this.range = 10;

		for (var i = 0; i < 2; i++) {
			var n;
			while(1){
				var low = this.resposta_certa - this.range < 0? 0: this.resposta_certa - this.range;
				var high = this.resposta_certa + this.range;
				n = Math.round(generateRandomNumber(low,high));
				if(n != this.resposta_certa && this.respostas[n] == undefined) break;
			}
			this.respostas[n] = n + " " + this.sufix;
		}

		var n = 0;
		for(i in this.respostas){
			if(this.respostas[i]){
				n++;
				var c = new Clickable(window.W/2, window.H/2 + 50*n, window.W*3/4, 40, this.respostas[i], (v) => {
					this.clicked(v);
				}, true);

				c.set_return_data(i);
				c.set_txt_color("white");
				c.set_txt_align("center");
				c.set_txt_pos("middle");
				c.set_txt_y_offset(10);

				clickables.push(c);		
			}
		}

		var x = new Clickable(window.W/2, window.H/2, window.W, window.H, this.pergunta, () => {
		});

		x.set_bg("rgba(1,1,1,0.5)");
		x.set_bg_hover("rgba(1,1,1,0.5)");
		x.set_txt_color("white");
		x.set_txt_align("center");
		x.set_txt_pos("middle");
		x.set_is_clickable(false);
		x.set_txt_y_offset(50);

		clickables.push(x);

	}

	clicked(i){
		if(i == this.resposta_certa){
			game.quiz = undefined;
			game.quiz_time = false;

			clickables = [];
			IS_GAME_RUNNING = true;

			game.score_up();
		}
		else{
			this.respostas.splice(i, 1);
			game.score_down();
		}
	}

	update(){

	}

	draw(){

	}

}
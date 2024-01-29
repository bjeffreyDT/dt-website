var spaceshipGame = function() {
    var $space = $('#space');
    var $spaceship = $('#spaceship');
    var lazerTpl = $('#lazer-tpl').html();
    var starTpl = $('#star-tpl').html();
    var enemyTpl = $('#enemy-tpl').html();
    var $livesCount = $('#livesCount');
    var $killCount = $('#killCount');
    var $window = $(window);
    var animationEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
    var spawnMap = {};
    var lives, kills, winW, winH, animationLoop, animateSpeed, animateFaster, spawnLoop;

    var randomPos = function() {
        return Math.floor((Math.random()*winW)+1)
    };

    var animations = function() {
        var $flames = $('.flames');

        function animate() {
            var $star = $(starTpl);
            var starPos = randomPos();

            $flames.toggleClass('burn');
            $space.append($star);
            $star
                .css('left', starPos)
                .toggleClass('fast', Math.random()<.5);
            setTimeout(function() {
                $star.addClass('shooting');
            }, 5);
            $star.on(animationEnd, function() { $star.remove();
            });
        }
        var animationLoop = setInterval(animate, animateSpeed);
    };

    var spawnEnemies = function() {
        spawnLoop = setInterval(newEnemy, 1000);
    };

    var newEnemy = function() {
        var $newEnemy = $(enemyTpl);
        var newEnemyPos = Math.max(Math.floor(randomPos()) - 50, 100);
        $space.append($newEnemy);
        $newEnemy.css('left', newEnemyPos);
        spawnMap[newEnemyPos] = $newEnemy;
        setTimeout(function() {
            $newEnemy.addClass('moving');
        }, 10);
        $newEnemy.on(animationEnd, enemyLanded);
    };

    var enemyLanded = function() {
        var $enemy = $(this);
        $enemy.remove();
        $space.addClass('hit');
        setTimeout(function() {
            $space.removeClass('hit');
        }, 100);
        delete spawnMap[$enemy.offset().left];
        lives--;
        $livesCount.html(lives);
        if (!lives) gameOver();
    };

    var track = function(e) {
        $spaceship.css('left', e.pageX - 25);
    };

    var shoot = function(e) {
        var $lazer = $(lazerTpl);
        var lazerPos = e.pageX - 4;
        $space.append($lazer);
        $lazer.css('left', lazerPos);
        setTimeout(function() {
            $lazer.addClass('shot');
        }, 10);
        $.each(spawnMap, function(enemyPos, $enemy) {
            if (enemyPos > lazerPos - 50 && enemyPos < lazerPos + 56 && !$enemy.is('.exploding')) {
                var delayToHit = Math.max(666 - (($enemy.position().top / winW) * 666), 10);
                setTimeout(function() {
                    explode($enemy);
                    $lazer.remove();
                }, delayToHit);
                delete spawnMap[enemyPos];
                return;
            }
        });
    };

    var explode = function($enemy) {
        $enemy.off(animationEnd);
        $enemy.addClass('exploding');
        $enemy.on(animationEnd, function() {
            $enemy.remove();
        });
        kills++;
        $killCount.html(kills);
        if (kills === 99) gameOver(true);
    };

    var gameOver = function(win) {
        $('#start').html(win ? 'YOU WIN' : 'RETRY?');
        $space.find('.enemy').remove();
        $space.removeClass('started');
        clearInterval(spawnLoop);
        clearInterval(animationLoop);
        $('.lazer').remove();
        $window.off('mousemove mousedown');
        spawnMap = {};
    };

    var init = function() {
        animateSpeed = 66;
        lives = 5;
        kills = 0;
        $livesCount.html(lives);
        $killCount.html(kills);
        winW = $window.width();
        winH = $window.height();
        $space.addClass('started');
        $window.on('mousemove', track);
        $window.on('mousedown', shoot);
        animations();
        spawnEnemies();
    };

    return init();
};

$('#start').on('click', spaceshipGame);

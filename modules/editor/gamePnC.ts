class ClassVersion {
    static this_version = "0.0.1";          // 버전
    version = ClassVersion.this_version;    // 모든 클래스에 부여하는 버전
}

// 포인트 앤 클릭 게임
class GamePnC extends ClassVersion {
    room: Room[];
    constructor({
        room = [new Room({})],
    }) {
        super();
        this.room = room.map(data => new Room(data));
    }
}

// 방
class Room extends ClassVersion {
    name: string;
    timeLimit: number;
    isOpened: boolean;
    side: Side[];
    constructor({
        name = '',
        timeLimit = 0,
        isOpened = true,
        side = [new Side({})]
    }) {
        super();
        this.name = name;
        this.timeLimit = timeLimit;
        this.isOpened = isOpened;
        this.side = side.map(data => new Side(data));
    }
}

// 방의 방향 | 면
class Side extends ClassVersion {
    name: string;
    description: string;
    frame: Frame;
    fabric: Fabric[];
    constructor({
        name = '',
        description = '',
        frame = null,
        fabric = [new Fabric({})],
    }) {
        super();
        this.name = name;
        this.description = description;
        this.frame = frame;
        this.fabric = fabric.map(data => new Fabric(data));
    }
}

// 방의 골자
class Frame extends ClassVersion {
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
    constructor({
        x = 220,
        y = 120,
        width = 220 + 440,
        height = 120 + 330,
        angle = 0,
        top = 170,
        left = 240,
        right = 240,
        bottom = 150,
    }) {
        super();
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.width = Math.round(width);
        this.height = Math.round(height);
        this.angle = Number(angle.toFixed(1));
        this.top = top;
        this.left = left;
        this.right = right;
        this.bottom = bottom;
    }
}

// 도형
class Fabric extends ClassVersion {
    option: Object;
    event: Object[];
    constructor({
        option = {},
        event = [{}],
    }) {
        super();
        this.option = option;
        this.event = event;
    }
}

// 이벤트
class Event extends ClassVersion {
    // 이동========================
    moveRoom: number | string; // 방의 번호|이름 입력
    moveSide: number | string; // 방향의 번호|이름 입력
    // 오브젝트====================
    getObj: { name: string, x: number, y: number, scaleX: number, scaleY: number }; // 객체의 이름을 찾고 그 객체를 생성한다
    setObj: { from: string, to: { name: string, x: number, y: number, scaleX: number, scaleY: number } }; // 객체의 이름을 찾고 바꿀 객체를 찾은 다음에 좌표와 크기를 맞춘다
    dropObj: string; // 객체의 이름을 찾고 그 객체를 삭제한다
    // 아이템======================
    getItem: string; // 아이템을 얻는다
    dropItem: string; // 아이템을 삭제한다
    // 시간========================
    startTime: { name: string, limit: number}; // 특정 시간을 제한만큼 설정한다
    endTime: string; // 특정 시간을 멈춘다
    // 소리========================
    startSound: { name: string, volume: number }; // 특정 소리를 볼륨만큼 재생한다
    endSound: string; // 특정 소리를 멈춘다
    constructor({
        moveRoom = null,
        moveSide = null,
        getObj = null,
        setObj = null,
        dropObj = null,
        getItem = null,
        dropItem = null,
        startTime = null,
        endTime = null,
        startSound = null,
        endSound = null
    }) {
        super();
        this.moveRoom = moveRoom;
        this.moveSide = moveSide;
        this.getObj = getObj;
        this.setObj = setObj;
        this.dropObj = dropObj;
        this.getItem = getItem;
        this.dropItem = dropItem;
        this.startTime = startTime;
        this.endTime = endTime;
        this.startSound = startSound;
        this.endSound = endSound;
    }
    save() {}
    load() {}
}

// 아이템
class Item extends ClassVersion {
    name: string;
    description: string;
    type: string;
    iconPath: string;
    imgPath: string;
    quantity: number;
    getItemMessage: string;
    uniteItem: string[];
    fabric: Fabric;
    constructor({
        name = '',
        description = '',
        type = '',
        iconPath = '',
        imgPath = '',
        quantity = 1,
        getItemMessage = null,
        uniteItem = [],
        fabric = new Fabric({}),
    }) {
        super()
        this.name = name;
        this.description = description;
        this.type = type;
        this.iconPath = iconPath;
        this.imgPath = imgPath;
        this.quantity = quantity;
        this.getItemMessage = getItemMessage;
        this.uniteItem = uniteItem;
        this.fabric = new Fabric({...fabric, option: {name: name}});
    }
}

export { ClassVersion, GamePnC, Room, Side, Frame, Fabric, Item }
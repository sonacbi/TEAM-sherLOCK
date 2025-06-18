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
    frame: Frame;
    fabric: Fabric[];
    constructor({
        frame = null,
        fabric = [],
    }) {
        super();
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
    edge: number[];
    constructor({
        x = 220,
        y = 120,
        width = 220 + 440,
        height = 120 + 330,
        edge = [170, 240, 240, 150],
    }) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.edge = edge;
    }
}

// 도형
class Fabric extends ClassVersion {
    option: Object;
    constructor({
        option = {},
    }) {
        super();
        this.option = option;
    }
}

// 이벤트
const GameEventType = {
    move: { room: 0, side: 0 },
    appearObj: { name: "" },
    hideObj: { name: "" },
    removeObj: { name: "" },
    changeObj: { from: "", to: "" },
    getItem: { name: "" },
    dropItem: { name: "" },
    startTime: { name: "" },
    endTime: { name: "" },
    // startSound: { name: "", volume: 1 },
    // endSound: { name:"" },
    save: {},
    delay: { time: 0 },
};

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

export { ClassVersion, GamePnC, Room, Side, Frame, Fabric, GameEventType, Item }
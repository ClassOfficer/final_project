class DataTable {
    constructor(id) { // 생성자이며, id 가져옴(table을 그린 id)
        this.id = id;
    }

    update(data, columns) { // 데이터와 컬럼을 가지고옴
        let table = d3.select(this.id);

        // 중첩 selection이지만 교수님께서 복잡하니까 깊게 들어가지 않고, 따라치기만 하라고 하심
        let rows = table
            .selectAll("tr") // 데이터 개수만큼 tr을 그림
            .data(data)      // tr에 data를 지정
            .join("tr")

        rows.selectAll("td") // tr 안에 td가 그만큼 또 들어감
            .data(d => columns.map(c => d[c])) // columns 명에 맞는 데이터가 세로로 쭉쭉 들어감
            .join("td")
            .text(d => d)
    }
}
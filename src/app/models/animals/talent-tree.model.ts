import { TalentTreeTypeEnum } from "../talent-tree-type-enum.model";

export class TalentTree {
    talentTreeType: TalentTreeTypeEnum;

    column1Row1Points: number;
    column1Row2Points: number;
    column1Row3Points: number;
    column1Row4Points: number;

    column2Row1Points: number;
    column2Row2Points: number;
    column2Row3Points: number;
    column2Row4Points: number;

    column3Row1Points: number;
    column3Row2Points: number;
    column3Row3Points: number;
    column3Row4Points: number;

    row2RequiredPoints: number;
    row3RequiredPoints: number;
    row4RequiredPoints: number;

    constructor() {
        this.talentTreeType = TalentTreeTypeEnum.none;
        this.row2RequiredPoints = 5;
        this.row3RequiredPoints = 10;
        this.row4RequiredPoints = 15;

        this.column1Row1Points = 0;
        this.column1Row2Points = 0;
        this.column1Row3Points = 0;
        this.column1Row4Points = 0;

        this.column2Row1Points = 0;
        this.column2Row2Points = 0;
        this.column2Row3Points = 0;
        this.column2Row4Points = 0;

        this.column3Row1Points = 0;
        this.column3Row2Points = 0;
        this.column3Row3Points = 0;
        this.column3Row4Points = 0;
    }

    getTalentPointsByColumn(column: number) {
        if (column === 0)
            return this.column1Row1Points + this.column1Row2Points + this.column1Row3Points + this.column1Row4Points;
        if (column === 1)
            return this.column2Row1Points + this.column2Row2Points + this.column2Row3Points + this.column2Row4Points;
        if (column === 2)
            return this.column3Row1Points + this.column3Row2Points + this.column3Row3Points + this.column3Row4Points;

        return 0;
    }

    getTalentPointsByRowColumn(row: number, column: number) {
        if (row === 0 && column === 0)
            return this.column1Row1Points;
        if (row === 1 && column === 0)
            return this.column1Row2Points;
        if (row === 2 && column === 0)
            return this.column1Row3Points;
        if (row === 3 && column === 0)
            return this.column1Row4Points;

        if (row === 0 && column === 1)
            return this.column2Row1Points;
        if (row === 1 && column === 1)
            return this.column2Row2Points;
        if (row === 2 && column === 1)
            return this.column2Row3Points;
        if (row === 3 && column === 1)
            return this.column2Row4Points;

        if (row === 0 && column === 2)
            return this.column3Row1Points;
        if (row === 1 && column === 2)
            return this.column3Row2Points;
        if (row === 2 && column === 2)
            return this.column3Row3Points;
        if (row === 3 && column === 2)
            return this.column3Row4Points;

        return 0;
    }

    getTotalSpentPoints() {
        var spentPoints = this.column1Row1Points + this.column1Row2Points + this.column1Row3Points + this.column1Row4Points +
            this.column2Row1Points + this.column2Row2Points + this.column2Row3Points + this.column2Row4Points +
            this.column3Row1Points + this.column3Row2Points + this.column3Row3Points + this.column3Row4Points;

        return spentPoints;
    }

    spendTalentPoint(row: number, column: number) {
        if (row === 0 && column === 0)
            this.column1Row1Points += 1;
        if (row === 1 && column === 0)
            this.column1Row2Points += 1;
        if (row === 2 && column === 0)
            this.column1Row3Points += 1;
        if (row === 3 && column === 0)
            this.column1Row4Points += 1;

        if (row === 0 && column === 1)
            this.column2Row1Points += 1;
        if (row === 1 && column === 1)
            this.column2Row2Points += 1;
        if (row === 2 && column === 1)
            this.column2Row3Points += 1;
        if (row === 3 && column === 1)
            this.column2Row4Points += 1;

        if (row === 0 && column === 2)
            this.column3Row1Points += 1;
        if (row === 1 && column === 2)
            this.column3Row2Points += 1;
        if (row === 2 && column === 2)
            this.column3Row3Points += 1;
        if (row === 3 && column === 2)
            this.column3Row4Points += 1;
    }
}

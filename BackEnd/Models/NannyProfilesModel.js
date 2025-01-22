import { type } from "os";

export default (sequelize, DataTypes) => {
    return sequelize.define('Nanny_Profiles', {
        nanny_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            unique: true
        },
        education_level: {
            type: DataTypes.ENUM(
                'none', 
                'high_school_student', 
                'high_school_incomplete', 
                'high_school_complete', 
                'technical_student', 
                'technical_graduate', 
                'university_graduate'
            ),
            allowNull: true
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
        ,
        job_type: {
            type: DataTypes.ENUM('full_time', 'temporary'),
            allowNull: true
        },
        experience_years: {
            type: DataTypes.ENUM('none', '1-2', '3-5', '5+'),
            allowNull: true
        },
        has_criminal_record: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        special_needs_experience: {
            type: DataTypes.BOOLEAN,
        },
        additional_info: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        currency:{
            type: DataTypes.STRING,
            allowNull: true
        },
        mounthly_Salary:{
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        daily_salary:{
            type: DataTypes.DOUBLE,
            allowNull: true
        }

    }, {
        tableName: 'Nanny_Profiles',
        timestamps: true
    });
};
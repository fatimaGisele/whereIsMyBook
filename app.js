const express= require("express");
const mysql = require('mysql');
const util = require('util');


const app= express();
const port= 3000;


app.use(express.json());

const conexion = mysql.createConnection({
    host: 'localhost',
	user: 'root',
	password: '',
	database: 'libreria'
});

conexion.connect((error)=>{
    if(error) {
        throw error;
    }

    console.log('Conexion con la base de datos mysql establecida');
});

const qy = util.promisify(conexion.query).bind(conexion);




//Desarrollo



//Categoría de Libros
    app.post("/categoria", async (req, res)=>
    {                 
        try{
            let nombre= req.body.nombre.toUpperCase() ; 
            
            if(nombre.trim().length== 0)
            {
                throw new Error('Se envio información vacia');
            }
            
            if(!nombre)
            {
                throw new Error ("No se envió el nombre de la categoría");  
            }
    
            let query= "SELECT * FROM categoria WHERE nombre = ?";
    
            let respuesta= await qy(query, [nombre]);
    
            if(respuesta.length > 0){                        
                throw new Error ("Esa categoría ya existe")
         
            }
    
            query= "INSERT INTO categoria (nombre) VALUES (?)"; 
    
            respuesta= await qy(query, [nombre]);
    
            res.send({'nombre': nombre});
            res.status(200);
        }
            catch(e){
                console.error(e.message);   
                res.status(413).send({"Error": e.message});
            }
        });
            
    
    app.get("/categoria", async (req, res)=>
    {                 
        try{
         const query= "SELECT * FROM categoria";
     
         const respuesta= await qy(query);
     
         res.send({"respuesta": respuesta});
     
         res.status(200);
     
        } 
        catch(e){
         console.error(e.message);   
         res.status(413).send({"Error": e.message});
            
        }
        
     });


    app.get("/categoria/:id", async (req, res)=>
    {   
        try{
            const query= "SELECT * FROM categoria WHERE categoria.id = ?";
    
            const respuesta= await qy(query,[req.params.id]);
            
            if(respuesta.length==0){  
                throw new Error("Categoría no encontrada")
            }

            res.send({"respuesta": respuesta});

            res.status(200)
    
        }
        catch(e){
            console.error(e.message);   
            res.status(413).send({"Error": e.message});
        }
    });


    app.delete("/categoria/:id", async (req, res)=>
    {   
        try
        { 
            const idCategoria = req.params.id ;
           

            let query = 'SELECT * FROM categoria WHERE id = ?' ; 
            let respuesta = await  qy ( query , [idCategoria]) ; 
            
            
            if(respuesta.length == 0)
            {
                throw new Error ( 'No existe la categoría indicada') ; 
            }

             query = 'SELECT * FROM libro WHERE categoriaID = ? AND personaID = ?' ; 
             respuesta = await  qy ( query , [idCategoria]) ;
             if(respuesta.length > 0 )
             {
                 throw new Error ( 'Hay libros de esa categoria prestados, no se puede borrar')
             }

            query = 'DELETE FROM categoria WHERE id = ? ' ; 
            respuesta = await qy(query,[idCategoria ]) ;
            res.status(200).send('Se Borro correctamente') ;
            }
        

            catch(e) 
    {
        console.error(e.message)  ;
        res.send({'error': e.message}) ;
    }
    })


// -----RUTA PERSONA-----

app.post('/persona', async ( req , res ) => 
{
    try{
        let nombre = req.body.nombre.toUpperCase() ;
        let apellido = req.body.apellido.toUpperCase() ;
        let imail = req.body.imail.toUpperCase() ; 
        let alias = req.body.alias.toUpperCase() ;
        if(nombre.trim().length==0 ||apellido.trim().length==0 ||imail.trim().length==0 || alias.trim().length==0 )
        {
            throw new Error ('Se envio información vacia')
        }

        if(!nombre || !apellido || !imail || !alias){
            throw new Error ('No se envio algunos de los datos necesarios') ;
        }

        let query = 'SELECT * FROM persona WHERE imail = ? ' ; 
        let respuesta= await qy ( query, [imail]) ; 
        
        if(respuesta.length > 0)
        {
            throw new Error ('Ese imail ya se encuentra registrado') ;
        }

        query = 'INSERT INTO persona(nombre , apellido , imail , alias ) VALUES  (?,?,?,?) ' ; 
        respuesta = await qy ( query , [nombre , apellido , imail ,alias ]) ;
        res.send({'respuesta':respuesta})
    }
    catch(e) 
    {
        console.error(e.message)  ;
        res.send({'error': e.message}) ;
    }
})

app.get('/persona', async ( req , res ) => 
{
    try
    {
        const query = 'SELECT * FROM persona' ;
        const respuesta = await qy ( query );
        res.status(200).send({'respuesta':respuesta}) ;        
    }

    catch(e)
    {
        console.error(e.message) ; 
        res.status(413).send({'error': e.message}) ;
    }

})

app.get('/persona/:id', async (req , res) => 
{
    
    try
    {
        let id = req.params.id
        let query = 'SELECT * FROM persona WHERE id = ?' ; 
        let respuesta = await qy ( query , [id]) ; 

        if(respuesta.length == 0)
        {
            throw new Error ('El id buscado no existe');
        }
        
        res.status(200).send({'respuesta':respuesta}) ;
    }
    catch(e)
    {
        console.error(e.message) ;
        res.status(413).send({'error': e.message}) ;
    }
})

app.put('/persona/:id', async ( req , res ) => 
{
    try
    {
        let nombre = req.body.nombre.toUpperCase() ; 
        let apellido = req.body.apellido.toUpperCase() ; 
        let alias = req.body.alias.toUpperCase() ;
        let id = req.params.id  ;

        if(nombre.trim().length==0 ||apellido.trim().length==0 ||alias.trim().length==0  )
        {
            throw new Error ('Se envio información vacia')
        }

        if(!nombre || !apellido || !alias)
        {
            throw new Error('No se ingreso alguno de los datos solicitados') ; 
        }       

        let query = 'SELECT * FROM persona WHERE id = ?' ; 
        let respuesta = await qy ( query, [id]) ; 

        if(respuesta.length == 0)
        {
            throw new Error ('No se encontro la persona') ; 
        }
        

        query = 'UPDATE persona SET nombre = ?, apellido = ?, alias = ? WHERE id = ?' ; 
        respuesta = await qy ( query, [nombre, apellido, alias, id] ) ; 
        res.status(200).send({'respuesta':respuesta}) ;
    }
    catch(e)
    {
        console.error(e.message) ;
        res.status(413).send({'error': e.message}) ;
    }
})

app.delete('/persona/:id', async ( req , res ) =>
{
    try
    {
        const idPersona = req.params.id ;
        let query = 'SELECT * FROM persona WHERE id = ?' ; 
        let respuesta = await  qy ( query , [idPersona]) ;

        if(respuesta.length == 0)
        {
            throw new Error ( 'No se encontro a la persona que desea eliminar') ; 
        }

        query = 'DELETE FROM persona WHERE id = ?' ; 
        respuesta = await qy(query,[idPersona]) ;
        res.status(200).send({'respuesta':respuesta}) ;
    }
    catch(e)
    {
        console.error(e.message) ;
        res.status(413).send({'error': e.message}) ;
    }
})

// Libros
    
app.post('/libro', async ( req , res ) =>
{
    try
    {
        let nombre = req.body.nombre.toUpperCase() ;
        let descripcion = req.body.descripcion.toUpperCase() ; 
        let categoriaID = req.body.categoriaID ; 
        ;

        if(nombre.trim().length==0 ||descripcion.trim().length==0 ||categoriaID.trim().length==0)
        {
            throw new Error ('Se envio información vacia')
        }

        if(!nombre || !descripcion || !categoriaID )
        {
            throw new Error (' No se envio la informacion solicitada') ;
        }

        let query = 'SELECT * FROM libro WHERE nombre = ?' ; 
        let respuesta = await qy ( query , [nombre ]) ;
       
        if(respuesta.length > 0 )
        {
            throw new Error ( 'Ese nombre ya existe');
        } 

        query = 'SELECT * FROM categoria WHERE id = ?' ; 
        respuesta = await qy( query , [ categoriaID]) ; 
        
        if(respuesta.length == 0)
        {
            throw new Error ( 'No se encontro la categoria') ;
        }

        query = 'INSERT INTO libro (nombre,  categoriaID , descripcion ) VALUES(?,?,?) '
        respuesta = await qy ( query , [nombre , categoriaID , descripcion ])  ; 
        
        res.status(200).send('libro cargado con exito. Nombre : ' + ' ' + nombre  + ' descripcion : ' + ' ' +  descripcion  + ' categoriaID : ' + ' ' + categoriaID )
    }
    catch(e)
    {
        console.error(e.message) ;
        res.status(413).send({'error': e.message}) ;
    }

})


app.get('/libro', async (req, res) => 
{
    try
    {
        let query = 'SELECT * FROM libro' ; 
        let respuesta = await qy(query) ;
        res.status(200).send({'respuesta': respuesta}) ;
    }
    catch(e)
    {
        console.error(e.message) ;
        res.status(413).send({'error': e.message}) ;
    }
})

app.get('/libro/:id' , async (req , res) =>
{   
    try
    {
        let id = req.params.id ;

        let query = 'SELECT * FROM libro WHERE id = ? ' ; 
        let respuesta = await qy( query , [id]) ;
        if(respuesta.length == 0)
        {
            throw new Error('No existe el libro') ; 
        }
        res.status(200).send({'respuesta': respuesta})
    }
    catch(e)
    {
        console.error(e.message) ;
        res.status(413).send({'error': e.message}) ;
    }
})

app.put('/libro/:id', async (req , res ) => 
{
    try
    {
        let descripcion = req.body.descripcion.toUpperCase() ; 
        let idLibro = req.params.id ;

        if(descripcion.trim().length==0)
        {
            throw new Error('Se envio vacia la nueva descripción')
        }
        if(!descripcion)
        {
            throw new Error('No se envio la nueva descripción') ;
        }
        let query = 'SELECT * FROM libro WHERE  id = ?' ; 
        let respuesta = await qy (query , [idLibro])  ;
        if( respuesta.length == 0)
        {
            throw new Error ( 'No se encontro el libro a modificar') ;
        }
        query = 'UPDATE LIBRO SET descripcion = ? WHERE id = ? ' ;
        respuesta = await qy ( query , [descripcion, idLibro]) ; 
        res.status(200).send('Se modifico la descripción de forma exitosa') ;
    }
    catch(e)
    {
        console.error(e.message) ;
        res.status(413).send({'error': e.message}) ;
    }
});

app.put("/libro/prestar/:id", async (req, res) => {
    try{
        let idLibro=req.params.id ;
        let personaID = req.body.personaID ;
        

        if(!personaID) {

            throw new Error ("No se enviaron los datos solicitados") ;
        }

        let query= "SELECT * FROM libro WHERE id = ?"
        let respuesta= await qy(query, [idLibro]) ;

        if(respuesta.length == 0){
            throw new Error ("El libro que se quiere prestar no existe");
        }

        query= "SELECT * FROM persona WHERE id = ?"
        respuesta= await qy(query, [personaID]) ;

        if(respuesta.length == 0)
        {   
            throw new Error ("La persona a la que se quiere prestar el libro no existe") ;
        }

        query ="SELECT * FROM libro WHERE personaID = ? AND id  = ? " ; 
        respuesta = await qy(query, [personaID , idLibro]) ; 
        if(respuesta.length > 0 )
        {
            throw new Error ( 'El libro se encuentra prestado')
        }

        query= "UPDATE libro SET personaID = ? WHERE id=?";
        respuesta= await qy(query, [personaID,idLibro]);
        res.status(200).send("El libro se prestó de modo exitoso")
    }
    catch(e){
        console.error(e.message) ;
        res.status(413).send({'error': e.message}) ;

    }
});

app.put('/libro/devolver/:id' ,  async ( req , res ) => 
{
    try 
    {
        
        let idLibro = req.params.id ;
        let personaID = req.body.personaID ; 

        if(personaID.trim().length==0 ) 
        {
            throw new Error ('Se envio información vacia')
        }

        if(!personaID)
        {
            throw new Error('No se ingreso la información necesaria') ; 
        }

        let query = 'SELECT * FROM libro WHERE id = ?' ;
        let respuesta = await qy ( query,[idLibro]) ; 
        
        if ( respuesta.length == 0)
        {
            throw new Error ('El libro que se quiere devolver no existe');
        }

        query = 'SELECT * FROM  libro WHERE personaID = ?'  ;
        respuesta = await qy (query , [personaID]);
       
        if(respuesta.length == 0) 
        {
            throw new Error ('La persona indicada no tiene ningun libro en este momento')
        }
        
        query = 'SELECT * FROM libro WHERE id = ? AND  personaID = ?' ;
        respuesta = await qy ( query, [idLibro, personaID ]) ; 
        if(respuesta.length== 0)
        {
            throw new Error("La persona indicada no retiro ese libro")
        }



        query = 'UPDATE libro SET personaID = ?  WHERE id = ? AND  personaID = ?' ;
        respuesta = await qy ( query, [null ,idLibro, personaID ]) ; 
        res.status(200).send('El libro se devolvio exitosamente') ;

    }
    catch(e)
    {
        console.error(e.message) ;
        res.status(413).send({'error': e.message}) ;
    }
})





app.delete("/libro/:id", async (req, res) => {
    try{
        let idLibro = req.params.id ; 
        let idPersona = req.body.idPersona ;  

        if(idPersona.trim().length==0)
        {
            throw new Error('Se envio información vacia');
        }
        let query= "SELECT * FROM libro WHERE id = ?"
        let respuesta= await qy(query , [idLibro]);

        if(respuesta == 0){
            throw new Error ("No se encuentra ese libro") ;
        }

        query= "SELECT * FROM libro WHERE  personaID = ? and id= ?" 
        respuesta= await qy(query, [idPersona, idLibro ])

        if(respuesta.length > 0){
            throw new Error ("El libro que se quiere eliminar se encuentra prestado")
        }

        query = 'DELETE FROM libro WHERE id = ? '
        respuesta= await qy(query, [ idLibro, ]) ;
        res.status(200).send({'respuesta':"El libro se borró exitosamente"});
    }
    catch(e){
        console.error(e.message) ;
        res.status(413).send({'error': e.message}) ;

    }

});

app.listen(port, ()=>{
    console.log("Escuchando en puerto", + port)
})
